let root_url = "http://comp426.cs.unc.edu:3001/";
const credentials = {
    username: 'yaxue',
    password: 'yx1123'
};

$(document).ready(() => {
    $('#clean-instance').click(function () {
        $.ajax({
            url: root_url + 'instances/',
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: (instances) => {
                for (let prop in instances) {
                    $.ajax({
                        url: root_url + 'instances/' + instances[prop].id,
                        type: 'DELETE',
                        xhrFields: {
                            withCredentials: true
                        },
                        success: (instance) => {
                            console.log("success");
                        }
                    });
                }
            }
        });
    });

    $('#clean-seat').click(function () {
        $.ajax({
            url: root_url + 'seats/',
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: (seats) => {
                for (let prop in seats) {
                    $.ajax({
                        url: root_url + 'seats/' + seats[prop].id,
                        type: 'DELETE',
                        xhrFields: {
                            withCredentials: true
                        },
                        success: (seat) => {
                            console.log("success");
                        }
                    });
                }
            }
        });
    });

    $('#clean-ticket').click(function () {
        $.ajax({
            url: root_url + 'tickets/',
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: (tickets) => {
                for (let prop in tickets) {
                    $.ajax({
                        url: root_url + 'tickets/' + tickets[prop].id,
                        type: 'DELETE',
                        xhrFields: {
                            withCredentials: true
                        },
                        success: (ticket) => {
                            console.log("success");
                        }
                    });
                }
            }
        });
    });
});