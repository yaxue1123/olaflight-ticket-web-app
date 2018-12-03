var root_url = "http://comp426.cs.unc.edu:3001/";
$(document).ready(() => {

  datepicker_voke();
  //read all the airport info and generate the string of auto complete
  airport_compelete();
  //listen to the click button
  $('body').on('click', '.search-btn', function() {
    let record = get_search_input();
    //remove the current div
    $(".content_div").children().remove();
    $("body").attr("id", "sub");
    $(".title_div").attr("id", "banner");
    //call to load a new mode
    set_result_page(record);
  });
});



var create_one_flight = function(one_flight, input) {
  let c_div = $('<div class="flight" id="' + one_flight.number + '"></div>');
  // in millisecond.
  let duration = Math.abs(moment(one_flight.departs_at) - moment(one_flight.arrives_at));
  let hour = parseInt(duration / 3600000);
  let minute = Math.round((duration / 3600000 - hour) * 60);

  //add space for image
  c_div.append('<div class = "aireline_img"></div>');
  //add flight info
  c_div.append('<div class = "flight_info"></div>');
  c_div.children(".flight_info").append("<div class='flight-wrap'></div>");

  //pair the airline
  pair_airline(one_flight.airline_id);

  // airport info.
  c_div.children(".flight_info").children(".flight-wrap").after('<div class = "airport_info">' + input['depart_text'].split(",")[0] + ' -> ' + input['arrive_text'].split(",")[0] + '<div>');
  // price.
  c_div.append('<div class = "price">$' + one_flight.info + '</div>');
  //checkout
  c_div.append('<button class = "checkout">Check</button>');

  return c_div;

  function pair_airline(airlineId) {
    // airline.
    $.ajax({
      url: root_url + 'airlines',
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      success: (response) => {
        console.log(response);
        search_airline(response, airlineId);
      }
    });

    function search_airline(response, id) {
      for (let prop in response) {
        if (response[prop].id === id) {
          // create_flight_info(response[prop].name);
          c_div.children(".flight_info").children(".flight-wrap").append('<span class = "airline_name">' + response[prop].name + '</span>');
          c_div.children(".flight_info").children(".flight-wrap").append('<span class = "flight_number">' + one_flight.number + '</span></br>')
            .append('<span class = "time_scope">' + (one_flight.departs_at).substring(12, 16) + ' - ' + (one_flight.arrives_at).substring(12, 16) + '</span>')
            .append('<span class = "duration">' + hour + 'h' + minute + 'min</span>');
          // fdiv.append('<div class = "airline_id">airline id: ' + response[prop].name + '<div>');
        }
      }
    }
  }

}


var show_search_result = function(info) {

  let div_to_append = $(".content_div");
  let depart_id = info['depart_id'];
  let arrive_id = info['arrive_id'];
  console.log(depart_id + ' ' + arrive_id);
  $.ajax({
    url: root_url + 'flights',
    type: 'GET',
    xhrFields: {
      withCredentials: true
    },
    success: (response) => {
      console.log(response);
      // Add filter by depart and arrival.
      for (let i = 0; i < response.length; i++) {

        if (response[i].departure_id == parseInt(depart_id) && response[i].arrival_id == parseInt(arrive_id)) {
          console.log("TRUE");
          let fdiv = create_one_flight(response[i], info);
          div_to_append.append(fdiv);
        }
      }
    }
  });
}

var set_result_page = function(input) {
  //add search bar
  $(".title_div").after('<div class = "search_div"></div>');
  $(".search_div").append('<div class="group"><span>From</span><input id="depart" type="text" list="airport" autocomplete=off><span>To</span><input id="arrive" type="text" list="airport" autocomplete=off></div>');
  $(".search_div").append('<div class="group"><span>On</span><input type="text" id="datepicker"></div>');
  $(".search_div").append('<button class="search-btn" id = "sub-search">Search</button>');
  //set default value
  datepicker_voke();
  $("#datepicker").datepicker('setDate', input['date'])
    .css("width", "50%");
  airport_compelete();
  let d_input = input['depart_text'].split(",")[0];
  let a_input = input['arrive_text'].split(",")[0];
  $("#depart").val(d_input).css("font-size", "15px").css("color", "#3f3f3f");
  $("#arrive").val(a_input).css("font-size", "15px").css("color", "#3f3f3f");

  //add sort function
  $(".content_div").append('<div class = "sort_feature"><space>sort by&nbsp&nbsp</space><button class = "sort_price">Price</button><button class = "sort_duration">Duration</button></div>');

  //call to get search result
  show_search_result(input);
}

var get_search_input = function() {
  //get the time data, airport data
  let date = $("#datepicker").datepicker('getDate');
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let select_date = [month, day];
  let depart_ap = $("#airport option[value='" + $("#depart").val() + "']").attr("id");
  let arrive_ap = $("#airport option[value='" + $("#arrive").val() + "']").attr("id");
  console.log(date, depart_ap, arrive_ap);
  return {
    'date': date,
    'date_array': select_date,
    'depart_id': depart_ap,
    'arrive_id': arrive_ap,
    'depart_text': $("#depart").val(),
    'arrive_text': $("#arrive").val(),
  };
}

var datepicker_voke = function() {
  $("#datepicker").datepicker();
}

var airport_compelete = function() {
  login();
  let air_list;
  //get json data
  $.ajax(root_url + "airports", {
    type: 'GET',
    dataType: 'json',
    xhrFields: {
      withCredentials: true
    },
    success: function(response) {
      let air_array = response;
      console.log(air_array);
      air_list = "<datalist id='airport'>";
      for (let i = 0; i < air_array.length; i++) {

        air_list = air_list + create_airport_list(air_array[i]);
        // qlist.append(qdiv);
        // let qid = air_array[i].id;
      }
      air_list = air_list + "</datalist>";
      $("#depart").append(air_list);
      $("#arrive").append(air_list);
    }
  });

  let create_airport_list = function(a_array) {
    let a_list = '<option id = "' + a_array.id + '" value = "' + a_array.code + ", " + a_array.city + ", " + a_array.state + '">';
    return a_list;
  }
}

var login = function() {
  $.ajax({
    url: root_url + 'sessions',
    type: 'POST',
    xhrFields: {
      withCredentials: true
    },
    data: {
      user: {
        username: 'yaxue',
        password: 'yx1123',
      },
    }
  });
}
