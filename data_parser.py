'''
Simple parser for our data.
Author: Nick Rabb (nrabb02@tufts.edu)
'''

import sys
import os
import argparse
import json
import math
from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd

def main(args):
    print("Parsing participants db...")
    path = handle_args(args)
    data = read_data_file()
    print(data)

def read_data_file():
    """ Read the psiturk file into a usable data structure.  """
    table = create_connection()
    s = table.select()
    rows = s.execute()

    data_column_name='datastring'
    data = []
    statuses = [3,4,5,7]
    # Use if there are workers to exclude
    exclude = []
    for row in rows:
        if row['status'] in statuses and row['uniqueid'] not in exclude:
            data.append(row[data_column_name])
    data = [json.loads(part)['data'] for part in data]

    # Assign unique IDs for all trials
    for part in data:
        for record in part:
            record['trialdata']['uniqueid'] = record['uniqueid']

    data = [record['trialdata'] for part in data for record in part]
    data_frame = pd.DataFrame(data)
    return data_frame

def create_connection():
    """
    Create a db connection with the MySQL database file in question.
    :return: Connection object or None otherwise.
    """
    db_url='sqlite:///participants.db'
    table_name='turkdemo'
    engine = create_engine(db_url)
    metadata = MetaData()
    metadata.bind = engine
    table = Table(table_name, metadata, autoload=True)
    print('Connection to db file established')
    return table

def handle_args(args):
    """
    Parse out the command line arguments.

    :param args: command line arguments
    """
    parser = argparse.ArgumentParser(description='Read the participants.db file and make use of the data.')
    parser.add_argument('filename', metavar='F', type=str, nargs='?', help='an optional other filename to read from', default='participants.db')
    parsed = parser.parse_args()

    return parsed.filename

'''
HELPFUL FUNCTIONS FOR OUR DATA USAGE
'''

def event_as_frame(df, event_num):
    """
    Convert a given event number from a raw data frame into
    a Pandas data frame

    :param df: The entire DataFrame for the trial data.
    :param event_num: The specific event number for which to generate a DataFrame.
    :return: A timeseries DataFrame capturing a single event (i.e. the playing of one puzzle)
    """

    return pd.DataFrame(df.loc[event_num, ['event_log'][0]])

def by_trial(df):
    """
    Convert the raw trial data into a structure that is keyed on
    participant uniqueid.

    :param df: The entire DataFrame for the trial data.
    :return: A dictionary of DataFrames keyed by participant
    number.
    """

    data_by_trial = {}
    for uniqueid in df.uniqueid.unique():
        participant_data = df[df.uniqueid == uniqueid]
        data_by_trial[uniqueid] = participant_data
    return data_by_trial

def trial_for_participant(df, participant_num):
    """
    Get the set of trials recorded for the nth participant.

    :param df: The entire DataFrame for the study
    :param participant_num: Which participant to fetch data for
    (0 <= participant_num <= as many people as have done the
    study!)
    """

    return by_trial(df)[df.uniqueid.unique()[participant_num]]

def puzzle_stages_only(trial_df):
    """
    Return only the stages from a trial that contained a puzzle.

    :param trial_df: a data frame containing only data from a
    certain participant's study trials.
    """
    return trial_df[trial_df.stage == 'p02-simple.html']

def puzzle_stages_for_participant(df, participant_num):
    """
    Grab only a certain participant's data, and within that,
    only entries that are puzzle stages.
    """
    return puzzle_stages_only(trial_for_participant(df, participant_num))

def add_stage_tsn_events(df):
    """
    Add stage transition mock events between each series of
    event logs for a given stage.

    :param df: This data frame is ideally a frame containing only
    data for puzzle stages for a given participant. Otherwise,
    I'm not sure why you're using this function.
    """
    for row in df.iterrows():
        row_data = row[1]['event_log']
        timestamp = row_data[len(row_data) - 1]['timeStamp'] + 1
        row_data.append(stage_transition_event(timestamp))

def in_order(df):
    """
    Just a quick check to see if the timestamps in an array are
    in order.

    :param df: Data frame with rows that include timestamped event
    data.
    """
    cur_ts = 0
    out_of_order = []
    for row in df.iterrows():
      row_data = row[1]['event_log']
      for event in row_data:
        if event['timeStamp'] <= cur_ts:
          out_of_order.append(event['timeStamp'])
        cur_ts = event['timeStamp']
    print(out_of_order)
    return len(out_of_order) == 0

def write_event_logs(df, filename, path):
    write_all_data_rows(df, filename, path, 'event_log', json.dumps)

def write_condition(df, filename, path):
    """
    Write a very short file containing the condition for the given
    data frame.

    :param df: The DataFrame whose data we want to write to file.
    :param filename: The name of the file we want to write.
    :param path: The path to the output file.
    """
    # check if path exists... if not, make it!
    if not os.path.exists(path):
        os.makedirs(path)
    out_file = open(path + '/' + filename, 'w')
    for row in df.iterrows():
        cond = row[1]['condition']
        if isinstance(cond, unicode):
            out_file.write(cond)
            break
    out_file.close()


def write_all_data_rows(df, filename, path, col='', formatter=None):
    """
    Write out a series of Pandas data rows with optional
    specification of the column that we want to output, and
    a formatter with which to write the file.

    :param df: The DataFrame whose data we want to write to file.
    :param filename: The name of the file we want to write.
    :param path: The path to the output file.
    :param? col: Optional - the column name that we'd like to
    output if not all columns.
    :param? formatter: Optional - a formatter to use when
    writing data to file.
    """
    all_events = []
    # check if path exists... if not, make it!
    if not os.path.exists(path):
        os.makedirs(path)

    out_file = open(path + '/' + filename, 'w')
    for row in df.iterrows():
        # TODO: This is the line that should be in the general
        # function, but for now, let's just use this incorrectly
        # for specifically event_log writing
        #row_data = row[1][col] if col != '' else row[1]
        row_data = row[1][col]
        for event in row_data:
           all_events.append(event)

    output = formatter(all_events) if formatter != None else all_events
    out_file.write(output)
    out_file.close()

def stage_transition_event(timestamp):
    """
    Mock an event that signifies a stage transition for our
    playback runner.

    :param timestamp: The timestamp we want to assign to the event
    This should ideally come after the previous event.
    :return: An event tuple we can use for a stage transition
    """

    return {"timeStamp": timestamp, "stageTransition": True}

def participant_events_to_json(df, participant_num):
    """
    Write out JSON event files for a given participant's
    study completion.

    :param df: A data frame containing all our data
    :param participant_num: The participant number whose events
    we want to write out
    """

    pn = trial_for_participant(df, participant_num)
    pnp = puzzle_stages_only(pn)
    part_dir = './event-logs/participant-' + str(participant_num)
    write_event_logs(pnp, 'all-events.json', part_dir)
    write_condition(pn, 'condition.txt', part_dir)

if __name__ == "__main__":
    """ Main method runner """
    main(sys.argv)
else:
    global df, ps4p, pe2j, aste, dbt
    df = read_data_file()
    dbt = by_trial(df)

    print('Read data into var `data_parser.df`; by trial into `data_parser.dbt`')
    """
    USEFUL ALIASES
    """
    ps4p = puzzle_stages_for_participant
    pe2j = participant_events_to_json
    aste = add_stage_tsn_events

    print('Some useful aliases:\n')
    print('ps4p - Puzzles Stages for Participant <df - data frame to get data from; par_index - index of the participant to fetch>')
    print('pe2j - Participant Events to JSON <df - data frame to get data from; par_index - index of the participant to fetch>')
    print('aste - Add Stage Transition Events <df - ideally data frame of only puzzle stages>')


