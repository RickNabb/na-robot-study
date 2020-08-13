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
    #path = handle_args(args)
    df = read_data_file()
    print('Writing out into CSV files...')
    csv_df_writer(df, './event-logs/test-csv')
    print('Done')

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

def vignette_stages(trial_df):
    """
    Return only the stages from a trial that contained a
    vignette or vignette response.

    :param trial_df: a data frame containing only data from a
    certain participant's study trials.
    """
    return trial_df[~trial_df.stage.isnull() & trial_df.stage.str.contains('vignette')]

def vignette_stages_for_participant(df, participant_num):
    """
    Grab only a certain participant's data, and within that,
    only entries that are vignette stages.
    """
    return vignette_stages(trial_for_participant(df, participant_num))

def trial_for_participant(df, participant_num):
    """
    Get the set of trials recorded for the nth participant.

    :param df: The entire DataFrame for the study
    :param participant_num: Which participant to fetch data for
    (0 <= participant_num <= as many people as have done the
    study!)
    """

    return by_trial(df)[df.uniqueid.unique()[participant_num]]

"""
 DATA WRITING
"""

def csv_df_writer(df, path):
    vignette_file = open(path + '/vignette.csv', 'w')
    v_followup_files = {}
    conditions = [ 'vignette4', 'vignette4_na', 'vignette_6', 'vignette6_na']
    v_conditions = ['vignette4', 'vignette6']
    for condition in v_conditions:
        v_followup_files[condition] = open(path + '/' + condition + '_followup.csv', 'w')

    """
    JS to output measure question ids:
    Object.keys(MEASURES).reduce((accum, cur) => {
        MEASURES[cur].items.forEach((item, i) => accum.push(`${cur}_Q${i+1}`))
            return accum
        }, [])
    """
    vignette_questions = [ "myerEtAl_Q1", "myerEtAl_Q2", "myerEtAl_Q3", "myerEtAl_Q4", "myerEtAl_Q5", "lyonsGuznov_Q1", "lyonsGuznov_Q2", "lyonsGuznov_Q3", "lyonsGuznov_Q4", "lyonsGuznov_Q5", "lyonsGuznov_Q6", "jianEtAl_Q1", "jianEtAl_Q2", "jianEtAl_Q3", "jianEtAl_Q4", "jianEtAl_Q5", "jianEtAl_Q6", "jianEtAl_Q7", "jianEtAl_Q8", "jianEtAl_Q9", "jianEtAl_Q10", "jianEtAl_Q11", "jianEtAl_Q12", "jianEtAl_Q13", "heerinkEtAl_Q1", "heerinkEtAl_Q2", "malle_Q1", "malle_Q2", "malle_Q3", "malle_Q4", "malle_Q5", "malle_Q6", "malle_Q7", "malle_Q8", "malle_Q9", "malle_Q10", "malle_Q11", "malle_Q12", "malle_Q13", "malle_Q14", "malle_Q15", "malle_Q16", "malle_Q17", "malle_Q18", "malle_Q19", "malle_Q20", "malle_Q21", "cameron_Q1", "cameron_Q2", "cameron_Q3", "cameron_Q4", "cameron_Q5", "cameron_Q6", "cameron_Q7", "cameron_Q8", "cameron_Q9", "cameron_Q10", "schaefer1_Q1", "schaefer1_Q2", "schaefer1_Q3", "schaefer1_Q4", "schaefer2_Q1", "schaefer2_Q2", "schaefer2_Q3", "schaefer2_Q4", "schaefer2_Q5", "schaefer2_Q6", "schaefer2_Q7", "schaefer2_Q8", "schaefer2_Q9", "schaefer2_Q10", "ghazali_Q1", "ghazali_Q2", "ghazali_Q3", "ghazali_Q4", "ghazali_Q5", "ghazali_Q6", "ghazali_Q7", "ghazali_Q8", "ghazali_Q9", "ghazali_Q10" ]
    v1_followup = [ "malle_Q8", "jianEtAl_Q4", "heerinkEtAl_Q1", "jianEtAl_Q13" ]
    v2_followup = [ "ghazali_Q3", "malle_Q1", "schaefer2_Q4", "schaefer2_Q8" ]
    v3_followup = [ "malle_Q9", "schaefer1_Q4", "malle_Q3", "cameron_Q2" ]
    v4_followup = [ "malle_Q11", "schaefer1_Q2", "jianEtAl_Q5", "schaefer2_Q3" ]
    v5_followup = [ "malle_Q13", "jianEtAl_Q7", "schaefer2_Q1", "jianEtAl_Q4" ]
    v6_followup = [ "malle_Q13", "jianEtAl_Q7", "schaefer2_Q1", "jianEtAl_Q4" ]

    def qs_from_followup(l):
        qs = []
        for q in l:
            qs.append(q + '_difficulty_Q1')
            qs.append(q + '_surety_Q1')
            qs.append(q + '_why')
        return qs

    follow_ups = {
        'vignette1': qs_from_followup(v1_followup),
        'vignette2': qs_from_followup(v2_followup),
        'vignette3': qs_from_followup(v3_followup),
        'vignette4': qs_from_followup(v4_followup),
        'vignette5': qs_from_followup(v5_followup),
        'vignette6': qs_from_followup(v6_followup)
    }

    trim_headers = lambda h: h[: len(h)-1]

    # Write headers for each file
    vignette_headers = 'uniqueid,condition,'
    for q in vignette_questions:
        vignette_headers += q + ','
    vignette_file.write(trim_headers(vignette_headers) + '\n')
    
    for condition in v_conditions:
        v_followup_headers = 'uniqueid,condition,'
        for q in follow_ups[condition]:
            v_followup_headers += q + ','
        v_followup_files[condition].write(trim_headers(v_followup_headers) + '\n')

    bt = by_trial(df)
    for i in range(0, len(bt)):
        ti = trial_for_participant(df, i)
        condition = ti.iloc[3].condition
        cond_no_na = condition.replace('_na','')
        write_csv_line_for_stage(ti, vignette_file, 'vignette.html', vignette_questions)
        write_csv_line_for_stage(ti, v_followup_files[cond_no_na], 'vignette-followup.html', follow_ups[cond_no_na])

    vignette_file.close()
    for f in v_followup_files:
        v_followup_files[f].close()

def write_csv_line_for_stage(trial_frame, f, stage, questions):
    stage_row = trial_frame.loc[trial_frame['stage'] == stage]
    stage_answers = stage_row.response.to_numpy()[0]

    line = ''
    line += trial_frame.iloc[0].uniqueid + ','
    line += trial_frame.iloc[3].condition + ','
    for q in questions:
        try:
            line += next(item for item in stage_answers if item['id'] == q)['val'] + ','
        except StopIteration:
            line += ','
    f.write(line[:len(line)-1] + '\n')


def csv_trial_writer(trial_frame):
   vignette_row = trial_frame.loc[trial_frame['stage'] == 'vignette.html']
   vignette_follow_row = trial_frame.loc[trial_frame['stage'] == 'vignette-followup.html']
   na_follow_row = trial_frame.loc[trial_frame['stage'] == 'na-followup.html']
   demo_row = trial_frame.loc[trial_frame['stage'] == 'demographics.html']

   vignette_answers = vignette_row.response.to_numpy()[0]
   v_follow_answers = vignette_follow_row.response.to_numpy()[0]
   na_answers = na_follow_row.response.to_numpy()[0]

   line += 'uniqueid,condition,'
   line += trial_frame.iloc[0].uniqueid + ','
   line += trial_frame.iloc[3].condition + ','
   for answer in answers:
       line += answer.val + ','

def write_event_logs_csv(df, filename, path):
    write_all_data_rows(df, filename, path, 'response')

def write_event_logs(df, filename, path):
    write_all_data_rows(df, filename, path, 'response', json.dumps)

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
    vs = vignette_stages(pn)
    part_dir = './event-logs/participant-' + str(participant_num)
    write_event_logs(vs, 'all-events.json', part_dir)
    write_condition(pn, 'condition.txt', part_dir)

def participant_events_to_csv(df, participant_num):
    pn = trial_for_participant(df, participant_num)
    part_dir = './event-logs/participant-' + str(participant_num)
    write_event_logs_csv(pn, 'participant' + str(participant_num) + '.csv', part_dir)

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
    vs4p = vignette_stages_for_participant
    pe2j = participant_events_to_json

    print('Some useful aliases:\n')
    print('vs4p - Vignette Stages for Participant <df - data frame to get data from; par_index - index of the participant to fetch>')
    print('pe2j - Participant Events to JSON <df - data frame to get data from; par_index - index of the participant to fetch>')
#    print('aste - Add Stage Transition Events <df - ideally data frame of only puzzle stages>')


