import json
from anytree import Node, RenderTree

battle_cards_file='docs/json/battle-cards.json'
battle_cards = json.load(open(battle_cards_file))

PIP_BLUE="🔷"
PIP_ORANGE="🔶"
PIP_GREEN="📗"
PIP_WHITE="⬜"
PIP_BLACK="⬛"


def all_pips(armor, utility, weapon):
    pips = ''
    if('Battle Icons' in armor['fields']):
        pips += ''.join(armor['fields']['Battle Icons'])
    if('Battle Icons' in utility['fields']):
        pips += ''.join(utility['fields']['Battle Icons'])
    if('Battle Icons' in weapon['fields']):
        pips += ''.join(weapon['fields']['Battle Icons'])
    return (PIP_BLUE in pips and 
            PIP_WHITE in pips and 
            PIP_BLACK in pips and
            PIP_GREEN in pips and
            PIP_ORANGE in pips)

def to_label(upgrade_card):
    if('Battle Icons' in upgrade_card['fields']):
        return upgrade_card['fields']['Name'] + ' ' + ''.join(upgrade_card['fields']['Battle Icons'])
    else:
        return upgrade_card['fields']['Name']


armors=[]
utilities=[]
weapons=[]

for card in battle_cards['records']:
    if(not 'Card Type' in card['fields']):
        print("No Card Type for " + card['fields']['Name'])
        continue
    card_type = card['fields']['Card Type']
    if(card_type == 'Upgrade'):
        sub_type=card['fields']['Sub-Type']
        if(sub_type == 'Armor'):
            armors.append(card)
        elif(sub_type == 'Utility'):
            utilities.append(card)
        elif(sub_type == 'Weapon'):
            weapons.append(card)
        else:
            print("Unknown Sub-Type: " + card['fields']['Sub-Type'])

combo_node=Node("Found Combinations:")

for armor in armors:
    armor_node=Node(to_label(armor), parent=combo_node)
    for utility in utilities:
        utility_node=Node(to_label(utility), parent=armor_node)
        for weapon in weapons:
            if(all_pips(armor, utility, weapon)):
                Node(to_label(weapon), parent=utility_node)
        if(not utility_node.children):
            utility_node.parent=None
    if(not armor_node.children):
        armor_node.parent=None

for pre, fill, node in RenderTree(combo_node):
    print("%s%s" % (pre, node.name))
