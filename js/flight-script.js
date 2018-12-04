let root_url = "http://comp426.cs.unc.edu:3001/";
const credentials = {
  username: 'yaxue',
  password: 'yx1123'
};

$(document).ready(() => {

  datepicker_voke();
  //read all the airport info and generate the string of auto complete
  airport_compelete();

  // ######################## P1 -> P2: search ###########################
  //listen to the click button
  $('body').on('click', '.search-btn', function() {
    let record = get_search_input();
    console.log(record)
    //remove the current div
    $(".title_div").children("#sub-banner").remove();
    $(".search_div").remove();
    $(".search_div").toggleClass("show_ticket");
    $(".content_div").children().remove();
    $("body").attr("id", "sub");
    $(".title_div").children("#title-img").hide();
    $(".title_div").append("<img id='sub-banner' src='./image/sub-banner.png' alt='sub-logo'>")

    //call to load a new mode
    set_result_page(record);
    datepicker_voke();
  });

  // ##################### P2 -> P3: select + fill info ##################
  $('body').on('click', '.checkout', function() {
    let record = get_search_input();
    let flight_id = $(this).attr("id");
    let div_to_change = $('.content_div');

    // clear content_div & the search_div
    div_to_change.empty().attr("id", "select_seat");
    $('.search_div').empty()
      .toggleClass("show_ticket");






    // show selected flight info.
    $.ajax({
      url: root_url + 'flights/' + flight_id,
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      success: (response) => {
        let new_div = show_one_flight(response, "one");
        //add flight info
        $('.search_div').append(new_div);

      }
    });

    // create an instance - flight id + date.
    $.ajax({
      url: root_url + 'instances',
      type: 'POST',
      xhrFields: {
        withCredentials: true
      },
      data: {
        instance: {
          flight_id: flight_id,
          date: record['date']
        }
      },
      success: (response) => {
        customer_container.append('<br><button class="order" id = ' + response.id + '>Order</button>');
        // customer_container.append('instance id: <a id="instance-id">' + response.id + '</a>');
        console.log("success create instance!!!");
      }
    });

    //initiate the seat map
    let [map, types] = show_seat();
    let sc = new SeatchartJS(map, types);
    let currency = "";
    sc.setAssetsSrc("./image/assets");
    sc.setCurrency(currency);
    sc.setSoundEnabled(false);

    div_to_change.append('<div id="map-container"></div>')
      .append('<div class="containers"></div>');
    $('.containers').append('<div id="legend-container"></div>');

    // create functions for seat
    sc.createMap("map-container");
    sc.createLegend("legend-container");
    div_to_change.append('<div class = "customer_container"></div>')
      .append('<div class = "flight_container"></div>');

    // layout the passenger information
    let customer_container = div_to_change.children(".customer_container");

    customer_container.append('<p class="flight-id" id = ' + flight_id + '>Customer Info</p>');
    // read user input of first name, last name, age, gender, seat.
    customer_container.append('<span>first name</span><input id="first-name"></input><br>');
    customer_container.append('<span>last name</span><input id="last-name"></input><br>');
    customer_container.append('<span>age</span><input id="age"></input><br>');
    customer_container.append('<span>gender</span><select id = "gender-options"><option value="male">Male</option><option value="female">Female</option></select><br>');
    customer_container.append('<span>seat</span><input id="seat-row" readonly="readonly"></input><input id="seat-number" readonly="readonly" ></input><br>');

    //listen to the seat selecting
    $('body').on('click', '.seatChart-seat', function(e) {
      //clear the previous clicking
      $('.seatChart-container .seatChart-seat').each(function() {
        if ($(this).hasClass("clicked") && !$(this).hasClass("legend-style")) {
          if ($(this)[0].innerHTML != e.currentTarget.innerHTML) {
            console.log("NOoooo");
            $(this).removeClass("clicked")
              .css("background-color", "#7189c0");
          }
        }
      })
      //auto fill the seat info
      customer_container.children("#seat-row").val('');
      customer_container.children("#seat-number").val('');
      let seat_row = e.currentTarget.innerHTML[0];
      let seat_number = e.currentTarget.innerHTML[1];
      console.log(seat_row, seat_number);
      customer_container.children("#seat-row").val(seat_row);
      customer_container.children("#seat-number").val(seat_number);
    });

  });

  // ###################### P3: create ticket ############################
  $('body').on('click', '.order', function() {
    let flight_id = $('.flight-id').attr("id");

    // choose seat and create a seat object.
    // require: plane id, row (1, 2, ...), and number ('A', 'B', ...)
    // plane id via flight id.
    $.ajax({
      url: root_url + 'flights/' + flight_id,
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      success: (response) => {
        // create a seat object.
        create_seat(response.plane_id,
          parseInt($('#seat-row').val()),
          $('#seat-number').val());
      }
    });
  });

  // ###################### P4: view ticket ##############################
  $('body').on('click', '.view-ticket', function() {
    console.log($(this).attr("id"));
    let ticket_id = parseInt($(this).attr("id"));
    let body = $('body');

    // clear body, new page.
    body.empty();

    $.ajax({
      url: root_url + 'tickets/' + ticket_id,
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      success: (response) => {
        show_ticket(response);
      }
    });
  });

});

var show_seat = function() {
  // ###################### Try: show seat ##############################
  let map = {
    rows: 9,
    cols: 9,
    // e.g. Reserved Seat [Row: 1, Col: 2] = 7 * 1 + 2 = 9
    reserved: [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21],
    disabled: [0, 8],
    disabledRows: [4],
    disabledCols: [4]
  };

  let types = [{
    type: "regular",
    color: "#d46d36",
    price: ""
  }, ];

  return [map, types];
}

var show_one_flight = function(one_flight, input) {
  let c_div;
  let flight_info = {};
  if (input === "all") {
    c_div = $('<div class="flight" id="' + one_flight.number + '"></div>');
  } else {
    c_div = $('<div class="a-flight" id="' + one_flight.number + '"></div>');
  }

  // in millisecond.
  let duration = Math.abs(moment(one_flight.departs_at) - moment(one_flight.arrives_at));
  let hour = parseInt(duration / 3600000);
  let minute = Math.round((duration / 3600000 - hour) * 60);

  // ***** copy an object of one flight. *****
  flight_info = one_flight;

  //add flight info
  c_div.append('<div class = "flight_info"></div>');
  c_div.children(".flight_info").append("<div class='flight-wrap'></div>");

  //pair the airline
  pair_airline(one_flight.airline_id);

  // airport info.
  search_airport(one_flight);


  // price.
  c_div.append('<div class = "price">$' + one_flight.info + '</div>');
  //checkout
  if (input === "all") {
    c_div.append('<button class = "checkout" id="' + one_flight.id + '">Check</button>');
  }

  // return [c_div, flight_info];
  return c_div;

  // input: flight object.
  function search_airport(flight) {
    let result = {};
    // airorts.
    $.ajax({
      url: root_url + 'airports',
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      success: (response) => {
        for (let prop in response) {
          if (response[prop].id == flight.departure_id) {
            result.departure = response[prop];
          }

          if (response[prop].id == flight.arrival_id) {
            result.arrival = response[prop];
          }
        }
        c_div.children(".flight_info").children(".flight-wrap")
          .after('<div class = "airport_info">' +
            result.departure.code + ' -> ' +
            result.arrival.code + '<div>');

        // ***** copy an object of one flight. *****
        flight_info.departure_airport = result.departure.code;
        flight_info.arrival_airport = result.arrival.code;
      }
    });
  }

  function pair_airline(airlineId) {
    // airline.
    $.ajax({
      url: root_url + 'airlines',
      type: 'GET',
      xhrFields: {
        withCredentials: true
      },
      success: (response) => {
        search_airline(response, airlineId);
      }
    });

    function search_airline(response, id) {
      for (let prop in response) {
        if (response[prop].id === id) {
          //add space for image
          c_div.append('<img class = "airline_img" src="' + response[prop].logo_url + '">');

          c_div.children(".flight_info").children(".flight-wrap")
            .append('<span class = "airline_name">' + response[prop].name + '</span>');
          c_div.children(".flight_info").children(".flight-wrap")
            .append('<span class = "flight_number">' + one_flight.number + '</span></br>')
            .append('<span class = "time_scope">' +
              moment(one_flight.departs_at).format('LT') + ' - ' +
              moment(one_flight.arrives_at).format('LT') + '</span>')
            .append('<span class = "duration">' + hour + 'h' + minute + 'min</span>');

          // ***** copy an object of one flight. *****
          flight_info.airline_logo = response[prop].logo_url;
          flight_info.airline_name = response[prop].name;
        }
      }
    }
  }
}

// var show_one_flight = function(one_flight, input) {
//   let c_div = $('<div class="flight" id="' + one_flight.number + '"></div>');
//   // in millisecond.
//   let duration = Math.abs(moment(one_flight.departs_at) - moment(one_flight.arrives_at));
//   let hour = parseInt(duration / 3600000);
//   let minute = Math.round((duration / 3600000 - hour) * 60);
//
//   //add space for image
//   c_div.append('<div class = "aireline_img"></div>');
//
//   //add flight info
//   c_div.append('<div class = "flight_info"></div>');
//   c_div.children(".flight_info").append("<div class='flight-wrap'></div>");
//
//   //pair the airline
//   pair_airline(one_flight.airline_id);
//
//   // airport info.
//   search_airport(one_flight);
//
//   // price.
//   c_div.append('<div class = "price">$' + one_flight.info + '</div>');
//   //checkout
//   if (input === "all") {
//     c_div.append('<button class = "checkout" id="' + one_flight.id + '">Check</button>');
//   }
//
//   return c_div;
//
//   // input: flight object.
//   function search_airport(flight) {
//     let result = {};
//     // airorts.
//     $.ajax({
//       url: root_url + 'airports',
//       type: 'GET',
//       xhrFields: {
//         withCredentials: true
//       },
//       success: (response) => {
//         for (let prop in response) {
//           if (response[prop].id == flight.departure_id) {
//             result.departure = response[prop];
//           }
//
//           if (response[prop].id == flight.arrival_id) {
//             result.arrival = response[prop];
//           }
//         }
//         c_div.children(".flight_info").children(".flight-wrap")
//           .after('<div class = "airport_info">' +
//             result.departure.code + ' -> ' +
//             result.arrival.code + '<div>');
//       }
//     });
//   }
//
//   function pair_airline(airlineId) {
//     // airline.
//     $.ajax({
//       url: root_url + 'airlines',
//       type: 'GET',
//       xhrFields: {
//         withCredentials: true
//       },
//       success: (response) => {
//         search_airline(response, airlineId);
//       }
//     });
//
//     function search_airline(response, id) {
//       for (let prop in response) {
//         if (response[prop].id === id) {
//           c_div.children(".flight_info").children(".flight-wrap").append('<span class = "airline_name">' + response[prop].name + '</span>');
//           c_div.children(".flight_info").children(".flight-wrap").append('<span class = "flight_number">' + one_flight.number + '</span></br>')
//             .append('<span class = "time_scope">' + (one_flight.departs_at).substring(12, 16) + ' - ' + (one_flight.arrives_at).substring(12, 16) + '</span>')
//             .append('<span class = "duration">' + hour + 'h' + minute + 'min</span>');
//         }
//       }
//     }
//   }
//
// }

var show_search_result = function(info) {

  let div_to_append = $(".content_div");
  let depart_id = info['depart_id'];
  let arrive_id = info['arrive_id'];

  $.ajax({
    url: root_url + 'flights',
    type: 'GET',
    xhrFields: {
      withCredentials: true
    },
    success: (response) => {
      // Add filter by depart and arrival.
      for (let i = 0; i < response.length; i++) {

        if (response[i].departure_id == parseInt(depart_id) &&
          response[i].arrival_id == parseInt(arrive_id)) {
          let fdiv = show_one_flight(response[i], "all");
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
  console.log(input['date']);
  $("#datepicker").datepicker('setDate', input['date'])
    .css("width", "50%");
  airport_compelete();
  let d_input = input['depart_text'];
  let a_input = input['arrive_text'];
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

var create_seat = function(plane_id, row, number) {
  $.ajax({
    url: root_url + 'seats',
    type: 'POST',
    xhrFields: {
      withCredentials: true
    },
    data: {
      seat: {
        plane_id: plane_id,
        row: row,
        number: number
      }
    },
    success: (response) => {
      console.log("success create seat!!!");
      create_ticket(response);
    }
  });
}

var create_ticket = function(response) {
  // create a ticket.
  // must wait seat create success.
  $.ajax({
    url: root_url + 'tickets',
    type: 'POST',
    xhrFields: {
      withCredentials: true
    },
    data: {
      ticket: {
        first_name: $('#first-name').val(),
        last_name: $('#last-name').val(),
        age: parseInt($('#age').val()),
        gender: $('#gender').val(),
        seat_id: response.id,
        instance_id: parseInt($('#instance-id').text()),
        is_purchased: true,
        price_paid: parseFloat($('#price').text())
      }
    },
    success: (response) => {
      console.log("success create ticket!!!");
      $('body').append('<div>Thank you for your order!</div>');
      $('body').append('<button class="view-ticket" id="' + response.id + '">View ticket</button>');
    }
  });
}

var show_ticket = function(one_ticket) {
  let body = $('body');
  body.append('First name: <div id="t-first-name">' + one_ticket.first_name + '</div>');
  body.append('Last name: <div id="t-last-name">' + one_ticket.last_name + '</div>');
  body.append('Age: <div id="t-age">' + one_ticket.age + '</div>');
  body.append('Gender: <div id="t-gender">' + one_ticket.gender + '</div>');
  // seat info via seat id.
  $.ajax({
    url: root_url + 'seats/' + one_ticket.seat_id,
    type: 'GET',
    xhrFields: {
      withCredentials: true
    },
    success: (response) => {
      body.append('Seat row: <div id="t-seat">' + response.row + '</div>');
      body.append('Seat number: <div id="t-seat">' + response.number + '</div>');
    }
  });

  // date and flight info via instance.
  $.ajax({
    url: root_url + 'instances/' + one_ticket.instance_id,
    type: 'GET',
    xhrFields: {
      withCredentials: true
    },
    success: (response) => {
      // date.
      body.append('Date: <div id="t-seat">' + response.date + '</div>');
      // flight info.
      $.ajax({
        url: root_url + 'flights/' + response.flight_id,
        type: 'GET',
        xhrFields: {
          withCredentials: true
        },
        success: (response) => {
          let flight_info = show_one_flight(response, "one");
          body.append(flight_info);
        }
      });
    }
  });
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
        username: credentials.username,
        password: credentials.password,
      },
    }
  });
}
