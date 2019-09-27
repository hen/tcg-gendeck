import json
import os

from airtable import Airtable

# Grab the cards, save them as JSON
def airtable_to_json_file(id, api_key, table_name, file_name):
    # Open a connection to Airtable
    at = Airtable(id, table_name, api_key=api_key)
    cards = at.get_all()
    data = { "records" : cards }
    json_file=open(file_name, 'w+')
    json_file.write(json.dumps(data, indent=2))
    json_file.close()

# Load the airtable key from disk
key_file=open('airtable.key', 'r')
key=key_file.read().rstrip(os.linesep)
key_file.close()

# ID for the transformers.cards application
transformers_card_id='appVjmNG3AukyOaQn'

# Grab cards
airtable_to_json_file(transformers_card_id, key, 'Bot Cards', 'docs/json/bot-cards.json')
airtable_to_json_file(transformers_card_id, key, 'Battle Cards', 'docs/json/battle-cards.json')
airtable_to_json_file(transformers_card_id, key, 'Combiner Forms', 'docs/json/combiner-forms.json')
