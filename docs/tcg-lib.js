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
    if(card.fields.Set==wave) {
      if(card.fields.Rarity==chosen_rarity) {
        if( (is_small_bot_card(card) && wantSmall) ||
            (!is_small_bot_card(card) && !wantSmall) )
        {
          cards.push(card);
        }
      }
    }
  });

  return cards[Math.floor(Math.random() * cards.length)];
}

function place_bot_card(card, css_class, css_container_id) {
  var img_index=chosen.fields['Image(s)'].length - 1;   // The last image seems to be the one with the stars
  chosen_item="<li class='" + css_class + "' id='" + chosen.id + "'><img src='" + chosen.fields['Image(s)'][img_index].thumbnails.large.url + "'/>";
    //  For alt:   + chosen.fields.Set + ": " + chosen.fields.Name + "</li>" );

  $( chosen_item ).appendTo( "#" + css_container_id );
}

function pull_bots(data, wave, widget) {
  chosen=get_bot_card(data, wave);
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
