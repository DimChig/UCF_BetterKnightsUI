function generateBadgeRating(rating) {
    let rating_badge_style = "bg-dark-subtle text-muted-2";
    if (rating) {
        if (rating < 2) {
            rating_badge_style = "bg-danger-subtle text-danger";
            rating_badge_style = "badge-red";
        } else if (rating < 4) {
            rating_badge_style = "bg-warning-subtle text-warning";
            rating_badge_style = "badge-yellow";
        } else {
            rating_badge_style = "bg-success-subtle text-success";
            rating_badge_style = "badge-green";
        }
    }

    rating_text = "N/A";
    if (rating) rating_text = rating + "/5";
    let el = $("<span class='badge " + rating_badge_style + "' style='margin-right: 5px'>" + rating_text + "</span>");
    el.addClass("badge-hover");
    return el;
}

function generateBadgeRatingAmount(ratings_amount) {
    let rating_badge_style = "bg-dark-subtle text-muted-2";
    let rating_text = "N/A";
    if (ratings_amount) {
        rating_text = ratings_amount + " ratings";
        rating_badge_style = "bg-dark-subtle text-muted";
    }
    let el = $("<span class='badge " + rating_badge_style + "''>" + rating_text + "</span>");
    el.addClass("badge-hover");
    return el;
}

function getTimeSortingValue(timeString) {
    if (!timeString) {
        return Number.MAX_SAFE_INTEGER; // Very large value if timeString is null
    }

    // Parse time string to extract hours, minutes, and AM/PM
    const match = timeString.match(/(\d{1,2}):(\d{2})(AM|PM)/);
    if (!match) {
        return Number.MAX_SAFE_INTEGER; // Return large value if format is wrong
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3];

    // Convert to 24-hour time
    if (period === "PM" && hours !== 12) {
        hours += 12;
    }
    if (period === "AM" && hours === 12) {
        hours = 0;
    }

    // Return sorting value based on total minutes from midnight
    return hours * 60 + minutes;
}

function generateTableInContainerWithData(container, data) {
    //Check if already added
    if (container.find("dimchig-table").length > 0) return;

    // Create the table structure with jQuery
    const $table = $('<table class="table dimchig-table table-striped table-bordered table-hover">').css({

    }).append(`
              <thead>
                  <tr>
                      <th scope="col">Class ID</th>
                      <th scope="col">Status</th> 
                      <th scope="col">Section</th>
                      <th scope="col">Mode</th>
                      <th scope="col">Days & Time</th>
                      <th scope="col">Instructor</th>
                      <th scope="col">Room</th>                      
                      <th scope="col">Meeting Dates</th>                                                          
                      <th scope="col">Select</th>
                  </tr>
              </thead>
              <tbody class='table-light'></tbody>
          `);
    const $tbody = $table.find('tbody');

    // Loop through each data object and generate rows
    $.each(data, function(index, item) {


        // Create a new <tr> element
        const $row = $('<tr>');

        // Class ID column
        const $classId = $('<td style="text-align: center" data-order="' + item.class + '">');
        if (item.class !== null) {
            let _class_el = item.elements.classElement;
            if (_class_el) {
                $($(_class_el).find("a")).css({
                    "color": "black",
                });
                $classId.append(_class_el);
            } else {
                $classId.text(item.class);
            }
        }




        // STATUS options and badge styles mapping
        let status_badge_style = "bg-light text-body-secondary";
        status_badge_text = "?";
        const statusMappings = {
            0: {
                label: 'Open',
                style: "badge-green"
            },
            1: {
                label: 'Waitlist',
                style: "badge-yellow"
            },
            2: {
                label: 'Closed',
                style: "badge-red"
            }
        };

        // Check if item.status is valid and apply the corresponding badge style
        if (item.status !== null && statusMappings.hasOwnProperty(item.status)) {
            status_badge_style = statusMappings[item.status].style;
            status_badge_text = statusMappings[item.status].label;
        }
        const $status = $('<td style="text-align: center; " data-order="' + item.status + '">').html(`<span class="badge ${status_badge_style}" style="font-size: 0.75rem;">${status_badge_text}</span>`);




        // SECTION options mapping with text and icon
        const sectionOptions = {
            1: {
                text: 'LECTURE',
                icon: 'fa-chalkboard-teacher',
                badge_style: "bg-success-subtle text-success"
            },
            2: {
                text: 'LAB',
                icon: 'fa-flask',
                badge_style: "bg-primary-subtle text-primary"
            },
            3: {
                text: 'RES',
                icon: 'fa-book',
                badge_style: "bg-danger-subtle text-danger"
            },
            4: {
                text: 'DISCUSSION',
                icon: 'fa-comments',
                badge_style: "bg-info-subtle text-info"
            },
            0: {
                text: null,
                icon: 'fa-book',
                badge_style: "bg-dark-subtle text-dark"
            },
        };
        let section_text = '';
        let section_icon = '';
        let section_badge_style = '';

        if (item.section.type !== null && sectionOptions.hasOwnProperty(item.section.type)) {
            section_text = sectionOptions[item.section.type].text;
            if (section_text == null) section_text = item.section.text;
            section_icon = sectionOptions[item.section.type].icon;
            section_badge_style = sectionOptions[item.section.type].badge_style;
        }
        const $section = $('<td style="text-align: center" data-order="' + item.section.type + '">');

        // Create the section badge and icon
        const $icon = section_icon ? $('<i>').addClass(`fas ${section_icon}`) : '';
        $icon.css({
            "margin-right": "5px",
        });
        const $text = $('<span>' + section_text + '</span>');
        const $badge = $('<span class="badge ' + section_badge_style + '"></span>');
        $badge.css({
            "width": "fit-content",
        });

        // Append icon (if it exists) and text to the badge
        if ($icon) $badge.append($icon);
        $badge.append($text);

        // Create the section description
        const $sectionInfo = $("<div class='section-info'></div>");
        $sectionInfo.css("align-items", "center");
        const $description = $('<small>');
        if (item.section && item.section.description) {
            $description.text(item.section.description);
        }
        $description.css({
            "color": "#2125294d",
        });

        // Append the description to the section info div
        $sectionInfo.append($badge).append($description);
        $section.append($sectionInfo);




        //MODE    
        const modeOptions = {
            0: {
                text: 'In Person',
                icon: 'fa-user',
                badge_style: "bg-success-subtle text-success"
            },
            1: {
                text: 'Mixed',
                icon: 'fa-adjust',
                badge_style: "bg-primary-subtle text-primary"
            },
            2: {
                text: 'Mixed-Mode<br>20% Classroom',
                icon: 'fa-chalkboard-teacher',
                badge_style: "bg-info-subtle text-info"
            },
            3: {
                text: 'Mixed with<br>Livestream',
                icon: 'fa-video',
                badge_style: null
            },
            4: {
                text: 'Livestream<br>20% Attendance',
                icon: 'fa-broadcast-tower',
                badge_style: null
            },
            5: {
                text: 'Video Content<br>20% Attendance',
                icon: 'fa-film',
                badge_style: null
            },
            6: {
                text: 'Video<br>Livestream',
                icon: 'fa-video',
                badge_style: null
            },
            7: {
                text: 'Online Video<br>Content',
                icon: 'fa-globe',
                badge_style: null
            },
            8: {
                text: 'Web-Based',
                icon: 'fa-laptop',
                badge_style: null
            }
        };

        // Convert mode or leave blank if null
        let modeText = '';
        let modeIcon = 'fa-question';
        let modeBadgeStyle = "bg-light text-body-secondary";

        if (item.mode !== null && modeOptions.hasOwnProperty(item.mode)) {
            modeText = modeOptions[item.mode].text;
            modeIcon = modeOptions[item.mode].icon;
            modeBadgeStyle = modeOptions[item.mode].badge_style;
            if (modeBadgeStyle == null) modeBadgeStyle = "bg-dark-subtle text-dark";
        }

        let $mode_row_icon = $("<i class='fas " + modeIcon + "'></i>");
        $mode_row_icon.css({
            "padding-right": "5px",
            "align-self": "center",
        });

        let $mode_row_text = $("<span class=''>" + modeText + "</span>");

        let $mode_row = $("<span></span>");
        $mode_row.addClass("badge " + modeBadgeStyle);
        $mode_row.css({
            'display': 'flex',
            'flex-direction': 'row',
            'width': 'fit-content',
            'justify-content': 'left',
            'text-align': 'left',
            'margin': 'auto'
        });
        $mode_row.append($mode_row_icon).append($mode_row_text);

        const $mode = $('<td data-order="' + item.mode + '" style="text-align: center; class="column">').append($mode_row);




        //DAYS AND TIMES
        let _startTime = null;
        if (item.daysAndTimes && item.daysAndTimes.length > 0 && item.daysAndTimes[0].startTime) _startTime = item.daysAndTimes[0].start_time
        const $daysAndTime = $('<td data-order=' + getTimeSortingValue(_startTime) + '></td>');
        $daysAndTime.css({
            "text-align": "center",
        });

        // Handle days array and build day boxes
        const days = ['M', 'Tu', 'W', 'Th', 'F'];
        const $dayBoxes = $('<div class="day-boxes"></div>');
        $dayBoxes.css({
            "max-width": "fit-content",
        });

        if (item.daysAndTimes && item.daysAndTimes[0].days) {
            $.each(item.daysAndTimes[0].days, function(i, day) {
                const $dayBox = $('<div class="day-box"></div>').text(days[i]);

                if (day === 1) {
                    $dayBox.addClass('filled');
                }

                $dayBoxes.append($dayBox);
            });
        }

        // Create the <td> element for days and time              
        let startTime = '';
        let endTime = '';
        let duration = '';

        // Check for item.daysAndTimes and extract start_time, end_time, and duration if they exist
        if (item.daysAndTimes && item.daysAndTimes[0]) {
            if (item.daysAndTimes[0].start_time) {
                startTime = item.daysAndTimes[0].start_time;
            }
            if (item.daysAndTimes[0].end_time) {
                endTime = item.daysAndTimes[0].end_time;
            }
            if (item.daysAndTimes[0].duration) {
                duration = item.daysAndTimes[0].duration;
            }
        }

        // Set the title attribute for hover effect
        $daysAndTime.attr('title', "Duration: " + duration);

        // Create the time and duration elements and append them
        const $timeDiv = $('<div></div>');
        if (startTime || endTime) $timeDiv.text(`${startTime} - ${endTime}`);
        $timeDiv.css({});
        const $durationDiv = $('<div></div>').append($('<small></small>'));

        // Append the day boxes, time, and duration to the <td> element
        $daysAndTime.append($dayBoxes).append($timeDiv).append($durationDiv);




        // Instructor column with badge
        const $instructor = $('<td>');
        if (item.instructors && item.instructors.length > 0) {
            for (let i in item.instructors) {
                let instructor_name = item.instructors[i];
                if (!instructor_name || instructor_name.length == 0) continue;
                // handle instructor
                let $instructor_el = $("<div></div>");
                $instructor_el.css({
                    "display": "flex",
                    "flex-direction": "column",
                    "justify-content": "center",
                    "vertical-align": "middle",
                });

                //top row
                let $badge_name = $("<span class='badge bg-primary-subtle text-primary badge-hover'></span>");
                let $badge_name_icon = $("<i class='fa fa-graduation-cap'></i>");
                $badge_name_icon.css("margin-right", "5px");
                //$badge_name.append($badge_name_icon);

                let $badge_name_span = $("<span>" + instructor_name + "</span>");
                $badge_name.append($badge_name_span);
                $badge_name.css({
                    "width": "fit-content",
                    "align-self": "center",
                });



                //rating row
                $badge_rating_container = $("<div></div>");
                $badge_rating_container.css({
                    "display": "flex",
                    "justify-content": "center",
                    "margin-top": "5px",
                });



                if (i == 0) $instructor.attr("data-order", 999);

                let $badge_rating = generateBadgeRating(null);
                $badge_rating_container.append($badge_rating);
                $badge_rating.attr("data-rmp-is-generated-rating", false);
                $badge_rating.attr("data-rmp-prof-name", instructor_name);

                let $badge_rating_amount = generateBadgeRatingAmount(null);
                $badge_rating_amount.attr("data-rmp-is-generated-rating-amount", false);
                $badge_rating_amount.attr("data-rmp-prof-name", instructor_name);
                $badge_rating_container.append($badge_rating_amount);

                $instructor_el.append($badge_name);
                $instructor_el.append($badge_rating_container);

                if (i == 0) {
                    $instructor_el.css({
                        "padding-bottom": "5px",
                    });
                } else {
                    $instructor_el.css({
                        "padding-top": "5px",
                        "border-top": "1px #dfe0e1 solid",
                    });
                }

                $instructor.append($instructor_el);
            }
        }




        //ROOM
        const $room = $('<td style="text-align: center">');
        if (item.rooms) {
            for (let i in item.rooms) {
                let item_room = item.rooms[i];
                if (item_room && item_room.google_maps_url) {

                    let building = item_room.building ? item_room.building.replace(/&nbsp;/g, '').trim() : '';
                    let room = item_room.room ? item_room.room.replace(/&nbsp;/g, '').trim().trim() : '';
                    if (room)
                        if (room[0] == "0" || room[0] == "O") room = room.substring(1);
                    let linkHtml = $(`<a href="${item_room.google_maps_url}" target="_blank" class="btn btn-link btn-sm">${building} ${room}</a>`);


                    linkHtml.css({
                        "text-decoration": "none",
                        "color": "black",
                        "cursor": "pointer",
                        "display": "block",
                        "font-size": "0.7rem",
                    }).hover(
                        function() {
                            // On hover
                            $(this).css("text-decoration", "underline");
                        },
                        function() {
                            // On hover out
                            $(this).css("text-decoration", "none");
                        }
                    );

                    $room.append(linkHtml);
                }
            }
        }




        // Meeting Dates column
        let meeting_dates_text = "";
        if (item.meetingDates && item.meetingDates !== null) {
            meeting_dates_text = item.meetingDates;
            if (meeting_dates_text.includes("-")) {
                let split = meeting_dates_text.split("-");
                meeting_dates_text = split[0].trim() + " -<br>" + split[1].trim();
            }
        }
        const $meetingDates = $('<td>').html(meeting_dates_text);

        // BUTTON & SYLLABUS


        // Select button column
        const $selectButton = $('<td>');
        let $selectButtonContainer = $("<div></div>");
        $selectButtonContainer.css({
            "display": "flex",
            "flex-direction": "column",
        });

        if (item.elements && item.elements.buttonAction) {
            //let $btn = $('<button class="btn btn-primary btn-sm" onclick="' + item.elements.buttonAction + '">SELECT</button>');


            let $btn = item.elements.buttonElement;
            $btn.removeClass().addClass('btn btn-primary btn-sm');
            $btn.css({
                "width": "100%",
            }).text("SELECT");

            $selectButtonContainer.append($btn);
            if (item.syllabusHref) {

                let $syllabus = $('<a href="' + item.syllabusHref + '" class="btn btn-outline-primary btn-sm">Syllabus</a>');
                $syllabus.css({
                    "margin-top": "5px",
                });
                let $syllabus_icon = $("<i class='fas fa-external-link-alt'></i>");
                $syllabus_icon.css("margin-left", "5px");
                $syllabus.append($syllabus_icon);
                $selectButtonContainer.append($syllabus);
            }
            $selectButton.append($selectButtonContainer);
        }

        // Append all <td> elements to the <tr>
        $row.append($classId, $status, $section, $mode, $daysAndTime, $instructor, $room, $meetingDates, $selectButton);

        // Append the row to the table body              
        $tbody.append($row);
    });

    // Append the table to the container
    $(container).append($table);


    // Custom sorting function to ensure sorting is based on data-order attribute
    $.fn.dataTable.ext.order['dom-data-order'] = function(settings, col) {
        return this.api().column(col, {
            order: 'index'
        }).nodes().map(function(td, i) {
            return $(td).attr('data-order') !== undefined ? $(td).attr('data-order') : $(td).text();
        });
    };

    // Initialize DataTables
    $table.DataTable({
        "paging": false, // Disable pagination
        "ordering": true, // Enable sorting
        "info": false, // Disable table info
        "dom": 'ftip',
        "columnDefs": [{
                "orderable": false,
                "targets": [6, 8]
            }, // Disable sorting on specific columns
            {
                "targets": [1, 2, 3, 4, 5], // Apply custom sorting for these columns
                "orderDataType": "dom-data-order" // Use custom sorting for data-order
            }
        ],
        "order": [
            [1, 'asc'],
            [2, 'asc'],
            [3, 'asc']
        ], // Default ordering by columns 1, 2, and 3
    });
    $(".dt-search").css("display", "none");
    $("#DataTables_Table_0_filter").css("display", "none");


    // Rate my proffessor
    collectAndProcessProfNames();

}


function collectAndProcessProfNames() {
    let profNames = [];

    // Loop through each element with the "data-rmp-prof-name" attribute and collect the names
    $('[data-rmp-prof-name]').each(function() {
        let profName = $(this).attr('data-rmp-prof-name');

        // Check if the professor's name is not already in the array before adding it
        if (profName && !profNames.includes(profName)) {
            profNames.push(profName); // Collect the name into the array
        }
    });

    // Loop through the array and call a function with each professor's name      
    profNames.forEach(function(name) {
        processProfessorName(name); // Call the async function
    });
}

// Example function that takes a professor's name as an argument
async function processProfessorName(name) {
    initRateMyProfessorFetch(name);
}


function updateAllElementsWithProfName(professorName, data) {
    if (data == null) return;
    // Find all elements with "data-rmp-prof-name" equal to profName
    let elements = $(`[data-rmp-prof-name='${professorName}']`);

    // Create arrays to store elements with specific attributes
    let elementsWithRatingAmount = [];
    let elementsWithRating = [];

    // Loop through each element found
    elements.each(function() {
        let $el = $(this);

        // Check and set "data-rmp-is-generated-rating"
        if ($el.attr('data-rmp-is-generated-rating') !== undefined) {
            $el.attr('data-rmp-is-generated-rating', 'true');
            elementsWithRating.push($el); // Store for later styling
        }

        // Check and set "data-rmp-is-generated-rating-amount"
        if ($el.attr('data-rmp-is-generated-rating-amount') !== undefined) {
            $el.attr('data-rmp-is-generated-rating-amount', 'true');
            elementsWithRatingAmount.push($el); // Store for later styling
        }
    });


    // Update data
    for (i in elementsWithRating) {
        let rating = data.avgRating;

        let oldElement = $(elementsWithRating[i]);
        let newElement = $(generateBadgeRating(rating)).insertAfter(oldElement);
        oldElement.remove();

        $($(newElement).closest("td")).attr("data-order", parseInt((5 - rating) * 100));

        let container = $($($(newElement).parent()).parent());
        if (container) {
            // Apply cursor style
            $(container).css('cursor', 'pointer').attr('title', 'Click to go to www.ratemyprofessors.com');;

            // Set the onclick listener to open a specific link
            $(container).on('click', function() {
                let url = data.url; // Specify the URL to open

                window.open(url, '_blank'); // Open the link in a new tab
            });
        }
    }

    for (i in elementsWithRatingAmount) {
        let rating_amount = data.numRatings;

        let oldElement = $(elementsWithRatingAmount[i]);
        let newElement = $(generateBadgeRatingAmount(rating_amount)).insertAfter(oldElement);
        oldElement.remove();
    }
}
