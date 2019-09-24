import json
import os

from airtable import airtable

# Grab the cards, save them as JSON
def airtable_to_json_file(at, table_name, file_name):
    cards = at.get(table_name)
    json_file=open(file_name, 'w+')
    json_file.write(json.dumps(cards, indent=2))
    json_file.close()

# Load the airtable key from disk
key_file=open('../airtable.key', 'r')
key=key_file.read().rstrip(os.linesep)
key_file.close()

# ID for the transformers.cards application
transformers_card_id='appVjmNG3AukyOaQn'

# Open a connection to Airtable
at = airtable.Airtable(transformers_card_id, key)

# Grab cards
airtable_to_json_file(at, 'Bot Cards', '../docs/json/bot-cards.json')
airtable_to_json_file(at, 'Battle Cards', '../docs/json/battle-cards.json')
airtable_to_json_file(at, 'Combiner Forms', '../docs/json/combiner-forms.json')
