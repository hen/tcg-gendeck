// Waves
var wave1="Wave 1";
var wave2="Wave 2";
var wave3="Wave 3";
var wave4="Wave 4";

var waves=[wave1, wave2, wave3, wave4];

function random_wave() {
  return random_from(waves);
}
function random_from(array) {
  return array[Math.floor(Math.random() * array.length)];
}

//  Wave 1:    Super Rare is 1:79
//  Wave 1:    
//  Wave 2:    Combiner is 1:2  (not really useful)
//  Wave 2:    
//  Wave 3:    Super Rare is 1:50, Uncommon-Small is 1:5.
//  Wave 3:    Rare is? 1:10?  Uncommon is?  1:3?
//  Wave 4:    Super Rare is 1:50, Uncommon-Small is 1:3.    (1:3 means 1 X card for every 3 Y cards; I think)
//  Wave 4:    Rare is?   Uncommon is?

// Matches order of array values below
var rarities = ['Common', 'Uncommon', 'Rare', 'Super-Rare']

var ratios={
  'Wave 1': [1, 53, 72, 80],        // Equivalent-ish of 1:(79/3):(79/10):79
  'Wave 2': [1, 53, 72, 80],        // Equivalent-ish of 1:(79/3):(79/10):79
  // TODO: Fix the below; it's 1:50 for SR not 1:79
  'Wave 3': [1, 53, 72, 80],        // Equivalent-ish of 1:(79/3):(79/10):79
  'Wave 4': [1, 53, 72, 80]         // Equivalent-ish of 1:(79/3):(79/10):79
};
var small_ratios={
  'Wave 1': null,
  'Wave 2': null,
  'Wave 3': [1, 6],                 // Equivalent of 1:3
  'Wave 4': [1, 4]                  // Equivalent of 1:3
};
var battle_card_makeup={
  'Wave 1': [4, 2, 1],
  'Wave 2': [4, 2, 1],
  'Wave 3': [3, 2, 1],
  'Wave 4': [3, 2, 1]
};

// Used to figure out which bot(s) to pull for the pack
function get_rarity_from_ratio(ratio_array) {
  highest = Math.max.apply(null, ratio_array);
  rarity_random = Math.ceil(Math.random() * highest);   // replace highest with max of ratios
  var chosen = '';
  $.each( ratio_array, function( idx, ratio ) {
    if(rarity_random >= ratio) {
      chosen = rarities[idx]
    }
  });
  return chosen;
}

function get_bot_card(data, wave) {
  return get_bot_card(data, wave, false);
}
function get_small_bot_card(data, wave) {
  return get_bot_card(data, wave, true);
}
function is_bot_on_back(card) {
  if(chosen.fields['Alt Type(s)']) {
    return chosen.fields['Alt Type(s)'].includes('Battle Master') 
        || chosen.fields['Alt Type(s)'].includes('Weaponizer');
  } else {
    return false;
  }
}
function is_small_bot_card(card) {
  var small = false;
  if(card.fields['Alt Type(s)']) {
    if(card.fields['Alt Type(s)'].includes('Battle Master')) {
      small = true;
    }
  }
  if(card.fields.Tribe) {
    $.each( card.fields.Tribe, function( idx, tribe ) {
      if( tribe.endsWith('Patrol') ) {
        small = true;
        return;
      }
    });
  }
  return small;
}
function get_bot_card(data, wave, wantSmall) {
  chosen_rarity = get_rarity_from_ratio( wantSmall ? small_ratios[wave] : ratios[wave] );

  var cards = [];

  $.each( data.records, function( idx, card ) {
    if(card.fields.Name!="Unknown Wave 4 Bot") {     // Temporary filter
      if(card.fields.Set==wave) {
        if(card.fields.Rarity==chosen_rarity) {
          if( (is_small_bot_card(card) && wantSmall) ||
              (!is_small_bot_card(card) && !wantSmall) )
          {
            cards.push(card);
          }
        }
      }
    }
  });

  return cards[Math.floor(Math.random() * cards.length)];
}

function place_bot_card(card, css_class, css_container_id) {
  var img_index=card.fields['Image(s)'].length - 1;   // The last image seems to be the one with the stars
  var card_item="<li class='" + css_class + "' id='" + card.id + "'><img src='" + card.fields['Image(s)'][img_index].thumbnails.large.url + "'/>";
    //  For alt:   + card.fields.Set + ": " + card.fields.Name + "</li>" );

  $( card_item ).appendTo( "#" + css_container_id );
}

function pull_bots(data, wave, widget) {
  var chosen=get_bot_card(data, wave);
  place_bot_card(chosen, "bot_card", "bot_cards" + widget);

  if(small_ratios[wave] != null) {
    chosen=get_small_bot_card(data, wave);
    place_bot_card(chosen, "small_card", "battle_cards" + widget);
  }
}

function get_n_unique_battle_cards(cards, n) {
  var chosen_cards = [];
  for (i = 0; i < n; i++) {
    var rnd = Math.floor(Math.random() * cards.length);
    chosen_cards.push( cards[rnd] );
    cards.splice( rnd, 1 );
  }
  return chosen_cards;
}
function get_battle_pack_for_wave(data, wave) {
  var wave_cards = [];

  // Create empty arrays for each rarity
  rarities.forEach( item => wave_cards[item] = [] );

  // Filter cards for wave into each rarity
  $.each( data.records, function( idx, card ) {
    if(card.fields.Name!="Unknown Wave 4 Battle Card") {     // Temporary filter
      if(card.fields.Set==wave) {
        wave_cards[card.fields.Rarity].push(card);
      }
    }
  });

  chosen_cards = [];

  battle_card_makeup[wave].forEach( 
    function(count, index) {
      chosen_cards = chosen_cards.concat( get_n_unique_battle_cards(wave_cards[rarities[index]], count ) );
    }
  );

  return chosen_cards;
}

function place_battle_card(card, css_class, css_container_id, index) {
  var drop_distance = 50 * index - 35;      // This needs to be different for wave 1/2
  var zIndex = index;
  chosen_item="<li style='top: " + drop_distance + "; z-index: " + zIndex + ";' class='small_card' id='" + card.id + "'><img src='" + card.fields['Image'][0].thumbnails.large.url + "'/>";
    //  For alt:   + chosen.fields.Set + ": " + chosen.fields.Name + "</li>" );

  $( chosen_item ).appendTo( "#" + css_container_id );
}

function pull_battle_cards(data, wave, widget) {
  var chosen=get_battle_pack_for_wave(data, wave);

  var incr = 1;

  if(small_ratios[wave] != null) {
    incr += 1;
  }

  $.each( chosen, function( idx, card ) {
    place_battle_card(card, "small_card", "battle_cards" + widget, idx + incr);
  });
}

// TODO: Genericize this to handle more than checked boxes
// Returns the values used so the subsequent code doesn't have to worry about whether or not defaults were used
function initialize_form_from_params(form_id, form_defaults) {

  var values=[];
  if(window.location.href.indexOf('?') == -1) {
    values=form_defaults;
  } else {
    var url = new URL(window.location.href);
    values=url.searchParams;
  }

  var form_lookup = "#" + form_id + " *";
  $(form_lookup).filter(':input').each( function() {

    for(var pair of values.entries()) {

      // TODO: Need to support other form elements.   Drop downs, Textfields.
      switch( $(this).prop('type') ) {
        case 'checkbox':
          if($(this).attr('name') == pair[0] && $(this).attr('value') == pair[1]) {
            $(this).attr('checked', true);
          }
          break;
        case 'submit':
          // ignore
          break;
        case 'select-multiple':
          if($(this).attr('name') == pair[0]) {
            var selected=$(this).val();
            selected.push(pair[1]);
            $(this).val(selected);
          }
          break;
        default:
          // supports at least 'text', 'select-one'
          if($(this).attr('name') == pair[0]) {
            $(this).val(pair[1]);
          }
      }
    }
  });

  return values;
}

// prefix is optional
// if included, then only items matching that prefix will be returned AND the prefix will be stripped
function params_to_hash(params, prefix) {
    var hash={};
    for(var key of params.keys()) {
        if(prefix) { 
            if(key.startsWith(prefix)) {
                var newkey=key.substr(prefix.length);
                hash[newkey]=params.getAll(key);
            }
        } else {
            hash[key]=params.getAll(key);
        }
    }
    return hash
}

// Populates HTML select boxes with data
function populate_options(data, field, form_id, targets) {
    var options = new Set();
    $.each( data.records, function( idx, card ) {
        if(card.fields[field]) {
            if(Array.isArray(card.fields[field])) {
                card.fields[field].forEach( value => {
                    options.add(value);
                });
            } else {
                options.add(card.fields[field]);
            }
        }
    });
    var sorted_options=Array.from(options);
    sorted_options.sort();
    targets.forEach( target => {
      var form_lookup = "#" + form_id + " :input[name='" + target + "']";
      sorted_options.forEach( option => {
        $(form_lookup).append("<option>" + option + "</option>");
      });
    });
}

