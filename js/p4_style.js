let root_url = "http://comp426.cs.unc.edu:3001/";
const credentials = {
    username: 'yaxue',
    password: 'yx1123'
};

$(document).ready(() => {




    // ###################### P4: view ticket ##############################

  
        let ticket_id = 7788;
        let body = $('body');
    
        // clear body, new page.
        $('.search_div').remove();
        $('.content_div').empty();
    
        $('.content_div').append($('<div class="ticket-container"><div>'));
        $('.content_div').append($('<div class="google-map"><div>'));
    
        $.ajax({
          url: root_url + 'tickets/' + ticket_id,
          type: 'GET',
          xhrFields: {
            withCredentials: true
          },
          success: (response) => {
            $('.ticket-container').append(show_ticket(response));
            $('.ticket-container').append('<button id="tickect-to-search">Back to home</button>');
            add_map();
          }
        });

        $.ajax({
            url: root_url + 'airports',
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: (airport) => {
                let map_airport = $('#map-airport').text();
                console.log("yeah!" + map_airport);
            
                for (let prop in airport) {
                    if (airport[prop].code == map_airport) {
                        console.log("yeah!" + map_airport);
                    }
                }
                    //$(".google-map").load("administrator.html");
               
            } 
        });

});

var add_map = function(ticket) {
    console.log(ticket);
}

// ###################### P4: view ticket ##############################
// ###################### P4: view ticket ##############################
var show_ticket = function (one_ticket) {
    let tdiv = $('<div class="ticket"></div>');
    let t_airline = $('<div class="ticket-airline"></div>');
    let t_flight = $('<div class="ticket-flight"></div>');
    let t_duration = $('<div class="ticket-duration"></div>');
    let t_price = $('<div class="ticket-price"></div>');
    let t_user = $('<div class="ticket-user"></div>');
    let t_seat = $('<div class="ticket-seat"></div>');
    let t_date = $('<div class="ticket-date"></div>');
    let t_logo = $('<div class="ticket-logo"></div>');

    // user info.
    t_user.append(one_ticket.first_name + ' ');
    t_user.append(one_ticket.last_name + ' ');
    t_user.append(one_ticket.gender);

    // seat info via seat id.
    $.ajax({
        url: root_url + 'seats/' + one_ticket.seat_id,
        type: 'GET',
        xhrFields: { withCredentials: true },
        success: (seat) => {
            t_seat.append('Seat: ' + seat.row + seat.number);
        }
    });

    // date and flight info via instance.
    $.ajax({
        url: root_url + 'instances/' + one_ticket.instance_id,
        type: 'GET',
        xhrFields: { withCredentials: true },
        success: (instance) => {
            // date.
            t_date.append('Depart at ' + instance.date);
            // flight info.
            $.ajax({
                url: root_url + 'flights/' + instance.flight_id,
                type: 'GET',
                xhrFields: { withCredentials: true },
                success: (flight) => {
                    // flight info.
                    t_flight.append(flight.number + '<br>');
                    t_flight.append(moment(flight.departs_at).format('LT') + ' - ' + moment(flight.arrives_at).format('LT') + '<br>');
                    t_duration.append(calculate_duration(flight.departs_at, flight.arrives_at));
                    t_price.append('$' + flight.info);

                    // airline.
                    $.ajax({
                        url: root_url + 'airlines',
                        type: 'GET',
                        xhrFields: {
                            withCredentials: true
                        },
                        success: (airline) => {
                            for (prop in airline) {
                                if(flight.airline_id === airline[prop].id) {
                                    t_airline.append(airline[prop].name);
                                    t_logo.append('<img src="' + airline[prop].logo_url + '">');
                                }
                            }
                        }
                    });

                    // airport.
                    let airports = {};
                    $.ajax({
                        url: root_url + 'airports',
                        type: 'GET',
                        xhrFields: {
                            withCredentials: true
                        },
                        success: (airport) => {
                            for (let prop in airport) {
                                if (airport[prop].id == flight.departure_id) {
                                    airports.departure = airport[prop];
                                }
            
                                if (airport[prop].id == flight.arrival_id) {
                                    airports.arrival = airport[prop];
                                }
                            }
                                //$(".google-map").load("administrator.html");
                                t_flight.append('<a id="map-airport">' + airports.departure.code + '</a> -> ' + airports.arrival.code);
                        } 
                    });

                }
            });
        }
    });

    // add styled element.
    tdiv.append(t_airline, t_flight, t_duration, t_price, t_date, t_user, t_seat, t_logo);
    return tdiv;
}

var show_one_flight = function (one_flight, input) {
    let c_div;
    if (input === "all") {
        c_div = $('<div class="flight" id="' + one_flight.number + '"></div>');
    } else {
        c_div = $('<div class="a-flight" id="' + one_flight.number + '"></div>');
    }

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
                        .append('<span class = "duration">' +
                            calculate_duration(one_flight.departs_at, one_flight.arrives_at) + '</span>');
                }
            }
        }
    }
}

var airport_compelete = function () {
    login();
    let air_list;
    //get json data
    $.ajax(root_url + "airports", {
        type: 'GET',
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        success: function (response) {
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

    let create_airport_list = function (a_array) {
        let a_list = '<option id = "' + a_array.id + '" value = "' + a_array.code + ", " + a_array.city + ", " + a_array.state + '">';
        return a_list;
    }
}

var create_seat = function (plane_id, row, number) {
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

var create_ticket = function (response) {
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

var login = function () {
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

var calculate_duration = function (departs_at, arrives_at) {
    // in millisecond.
    let duration = Math.abs(moment(departs_at) - moment(arrives_at));
    let hour = parseInt(duration / 3600000);
    let minute = Math.round((duration / 3600000 - hour) * 60);

    return hour + 'h' + minute + 'min';
}