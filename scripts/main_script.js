window.getWindowClassSearchTableContainer = function () {
  let element1 = $('td.PSGROUPBOXLABEL:contains("class section(s) found")');
  let element2 = $("#DERIVED_REGFRM1_TITLE1");

  let table_container = $(
    "#win0divDERIVED_CLSRCH_GROUP6 #win0divSSR_CLSRSLT_WRK_GROUPBOX1 #ACE_SSR_CLSRSLT_WRK_GROUPBOX1"
  );
  if (
    element1.length == 0 ||
    element2.length == 0 ||
    table_container.length == 0
  )
    return null;
  return table_container;
};

window.getWindowClassSearchFilterContainer = function () {
  let element1 = $('td.PSGROUPBOXLABEL:contains("Search for Classes")');
  let element2 = $("#win0divDERIVED_CLSRCH_GROUP2");

  let container = $("#win0divDERIVED_CLSRCH_GROUP2 #ACE_DERIVED_CLSRCH_GROUP2");
  if (element1.length == 0 || element2.length == 0 || container.length == 0)
    return null;
  return container;
};

window.prettifySection = function (text) {
  // Example: '0002-LEC REGULAR'
  try {
    let options = {
      LEC: 1,
      LAB: 2,
      RES: 3,
      DIS: 4,
    };
    let description = null;
    let option_type = null;

    // Loop through the options
    for (const option in options) {
      if (text.includes(option)) {
        description = text
          .replaceAll("-" + option, "")
          .replaceAll(option, "")
          .replaceAll("\n", " ")
          .trim();
        option_type = options[option];

        return {
          type: option_type, // The matching option type (LEC, LAB, DIS)
          description: description, // Cleaned description without the option
          text: option,
        };
      }
    }

    // default case
    option_type = 0;

    let section_text = text.split("\n")[0].split("-")[1];
    description = text
      .replaceAll("-" + section_text, "")
      .replaceAll(section_text, "")
      .replaceAll("\n", " ")
      .trim();
    return {
      type: option_type, // The matching option type (LEC, LAB, DIS)
      description: description, // Cleaned description without the option
      text: section_text,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

window.prettifyMode = function (mode) {
  // Example: 'IN PERSON (P)'
  try {
    let options = {
      P: 0, // In Person
      M: 1, // Mixed
      MR: 2, // Mixed-Mode 20% Classroom
      ML: 3, // Mixed with Livestream
      RL: 4, // Livestream, 20% Classroom Attendance
      RS: 5, // Video Content, 20% Classroom Attendance
      VL: 6, // Video Livestream
      V: 7, // Online Video Content
      W: 8, //Web-Based
    };

    let typeId = null;

    // Loop through options to find the matching mode
    for (let option in options) {
      // Check if the text contains the mode in parentheses, e.g., (P), (M), (ML)
      if (mode.includes("(" + option + ")")) {
        return options[option]; // Get the corresponding type ID from the options
      }
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
};

window.parseTime = function (timeString) {
  if (timeString == null) return null;
  const [time, modifier] = timeString.split(/(AM|PM)/i);
  if (time == null || modifier == null) return null;
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return {
    hours,
    minutes,
  };
};

window.prettifyDaysAndTimesLine = function (inputString) {
  try {
    const daysMap = {
      Mo: 0,
      Tu: 1,
      We: 2,
      Th: 3,
      Fr: 4,
    };
    const result = {
      days: [0, 0, 0, 0, 0],
      start_time: "",
      end_time: "",
      duration: "",
    };

    const daysPart = inputString.split(" ")[0];
    const timePart = inputString.substring(daysPart.length).trim();

    // Process days part
    for (let i = 0; i < daysPart.length; i += 2) {
      const day = daysPart.substring(i, i + 2);
      if (daysMap.hasOwnProperty(day)) {
        result.days[daysMap[day]] = 1;
      }
    }

    // Process time part
    const [startTime, endTime] = timePart.split(" - ");

    result.start_time = startTime;
    result.end_time = endTime;

    // Calculate duration
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (start == null || end == null) return null;

    let durationMinutes =
      end.hours * 60 + end.minutes - (start.hours * 60 + start.minutes);
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60; // handle case where end time is past midnight
    }

    if (durationMinutes >= 60) {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      result.duration = `${hours} hour`;
      if (minutes > 0) result.duration += ` ${minutes} min`;
    } else {
      result.duration = `${durationMinutes} min`;
    }

    return result;
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

window.prettifyDaysAndTimes = function (input) {
  // Example: 'MoWeFr 9:00 AM - 11:00 AM'
  let data = [];
  if (!input || input.length == 0) return;
  let split = input.split("<br>");
  for (let i = 0; i < split.length; i++) {
    if (!split[i] || split[i].length == 0) continue;
    let line = split[i].replaceAll("\n", "").trim();
    var line_data = window.prettifyDaysAndTimesLine(line);
    if (!line_data) continue;
    data.push(line_data);
  }
  if (data.length == 0) return null;
  return data;
};

window.prettifyRoom = function (text) {
  if (!text || text == null || text.length == 0) return null;
  // Check if there is a space between the building and room number
  if (!text.includes(" ")) {
    return {
      text: text.trim(),
    };
  }

  // Split the text into building and room
  let [building, room] = text.split(" ");
  building = building.trim();
  room = room.trim();

  // Generate Google Maps URL
  const query = `University of Central Florida - Building ${building}`;
  let googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    query
  )}`;

  return {
    building: building,
    room: room,
    google_maps_url: googleMapsUrl,
  };
};

window.prettifyRooms = function (text) {
  let data = [];
  let split = text.split("\n");
  for (let i = 0; i < split.length; i++) {
    let line = split[i];
    if (!line || !line.length) continue;
    let row_data = window.prettifyRoom(line.trim());
    if (row_data == null) continue;
    data.push(row_data);
  }
  return data;
};

window.prettifyInstructor = function (text) {
  try {
    var instructors = [];
    var split = text.split("<br>");
    for (let i = 0; i < split.length; i++) {
      var name = split[i].replaceAll(",", "").trim();
      if (name.length > 0 && !instructors.includes(name))
        instructors.push(name);
    }
    return instructors;
  } catch (err) {
    console.log(err);
    return null;
  }
};

window.prettifyMeetingDates = function (text) {
  // Example: '01/06/2025 - 01/12/2025'
  if (!text || text.length == 0) return null;
  if (text.includes("<br>")) text = text.split("<br>")[0].trim();
  return text.trim();
};

window.prettifyStatus = function (text) {
  // Example: OPEN / WAITLIST / CLOSED
  let options = {
    open: 0,
    waitlist: 1,
    closed: 2,
  };
  // Loop through options to find the corresponding option_id
  text = text.trim().toLowerCase();
  if (options.hasOwnProperty(text)) {
    return options[text];
  }
  return null;
};

window.extractDataFromTableRow = function (container) {
  var tr = $(container).find("[id^='trSSR_CLSRCH_MTG1\\$']");
  if (tr.length === 0) return null;

  // Extracting data and elements from each column in the row
  let classNumberElement = $(tr).find("[id^='MTG_CLASS_NBR']")[0] ?? null;
  let classNumber = parseInt(
    $(classNumberElement)?.find("a")?.text()?.trim() ?? null
  );

  let sectionDetailsElement = $(tr).find("[id^='MTG_CLASSNAME']")[0] ?? null;
  let sectionDetails = $(sectionDetailsElement)?.text()?.trim() ?? null;

  let modeElement = $(tr).find("[id^='INSTRUCT_MODE_DESCR']")[0] ?? null;
  let mode = $(modeElement)?.text()?.trim() ?? null;

  let timesElement = $(tr).find("[id^='MTG_DAYTIME']")[0] ?? null;
  let times = $(timesElement)?.html() ?? null;

  let roomElement = $(tr).find("[id^='MTG_ROOM']")[0] ?? null;
  let room = $(roomElement)?.text() ?? null;

  let instructorElement = $(tr).find("[id^='MTG_INSTR']")[0] ?? null;
  let instructor = $(instructorElement)?.html() ?? null;

  let datesElement = $(tr).find("[id^='MTG_TOPIC']")[0] ?? null;
  let dates = $(datesElement)?.html() ?? null;

  let statusElementImage =
    $(tr).find("[id^='win0divDERIVED_CLSRCH_SSR_STATUS_LONG'] img")[0] ?? null;
  let status = "?";
  if (statusElementImage) {
    let statusSrc = $(statusElementImage)?.attr("src");
    if (statusSrc?.includes("STATUS_OPEN")) status = "open";
    if (statusSrc?.includes("STATUS_WAITLIST")) status = "waitlist";
    if (statusSrc?.includes("STATUS_CLOSED")) status = "closed";
  }

  let isZeroCost =
    $(tr).find("[id^='win0divFX_DERIVED_RO_FX_ZERO_COST_TXTBK']").length > 0;

  let syllabusElement =
    $(tr).find("[id^='FX_INST_CLS_WRK_HTMLAREA']")[0] ?? null;
  let syllabusHref = $(syllabusElement)?.find("a")?.attr("href") ?? null;

  let buttonElement =
    $(tr).find("[id^='win0divSSR_PB_SELECT'] a input")[0] ?? null;
  let buttonAction = null;
  if (buttonElement) {
    let buttonId = $(buttonElement).attr("id");
    let href = $(buttonElement).attr("onclick");
    if (href != null)
      buttonAction = href.replace("this.id", "'" + buttonId + "'");
  }
  buttonElement = $(buttonElement)?.clone() ?? null;

  // Assembling the object
  return {
    class: classNumber,
    section: window.prettifySection(sectionDetails),
    mode: window.prettifyMode(mode),
    daysAndTimes: window.prettifyDaysAndTimes(times),
    rooms: window.prettifyRooms(room),
    instructors: window.prettifyInstructor(instructor),
    meetingDates: window.prettifyMeetingDates(dates),
    status: window.prettifyStatus(status),
    syllabusHref: syllabusHref,
    isZeroCost: isZeroCost,
    elements: {
      classElement: classNumberElement,
      sectionElement: sectionDetailsElement,
      modeElement: modeElement,
      daysAndTimesElement: timesElement,
      roomElement: roomElement,
      instructorElement: instructorElement,
      meetingDatesElement: datesElement,
      statusElementImage: statusElementImage,
      syllabusElement: syllabusElement,
      buttonElement: buttonElement,
      buttonAction: buttonAction,
    },
  };
};

window.showToast = function (text) {
  // Generate the correct path for the image using chrome.runtime.getURL
  try {
    const imagePath = chrome.runtime.getURL("images/popup_icon_128.png");

    // Check if the toast container already exists, if not, append it
    if (!$("#liveToast").length) {
      $("body").append(`
              <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 999; width: 300px; height: fit-content">
                <div id="liveToast" class="toast hide" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="15000">
                  <div class="toast-header">
                    <img src="${imagePath}" class="rounded me-2" style="width: 20px; margin-right: .2rem !important;">
                    <strong class="me-auto">BetterKnightsUI</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                  </div>
                  <div class="toast-body"></div>
                </div>
              </div>
            `);

      // Update the toast message with the provided text
    }

    $("#liveToast .toast-body").html(text);

    //Show the toast using Bootstrap's toast method
    var toast = new bootstrap.Toast($("#liveToast"));
    toast.show();
    return toast;
  } catch (err) {}
  return null;
};

window.showToastShare = function () {
  // create popup
  let html =
    "<span style='display: block'><strong style='display: block'>Enjoying the new look?</strong> Share this extension with friends!</span>";
  let btn =
    '<button id="copyLinkBtn" class="btn btn-light btn-sm" style="color: #d4b032; background-color: #f9f4e6; width: 100%; text-align: center; margin-top: 5px">Copy Link</button>';
  let shareContainer =
    '<input type="text" id="shareURL" value="https://chrome.google.com/webstore/detail/betterknightsui/enclfeopdchccjmnlpgcejjibahkkjkj" style="position: absolute; left: -9999px;">';
  html +=
    '<div style="width: 100%; text-align: center; height: fit-content">' +
    btn +
    shareContainer +
    "</div>";
  let toast = window.showToast(html);
  $("#copyLinkBtn").on("click", function () {
    var $shareInput = $("#shareURL");

    // Temporarily show the input for selection
    $shareInput
      .css({
        position: "relative",
        left: "auto",
      })
      .select();
    $shareInput[0].setSelectionRange(0, 99999); // For mobile devices

    // Attempt to copy to clipboard
    try {
      document.execCommand("copy");
      toast.hide();
      window.showToast("Link copied! Share it with friends");
    } catch (err) {
      alert("Copy failed. Please select and copy the link manually.");
    }

    // Hide the input after copying
    $shareInput.css({
      position: "absolute",
      left: "-9999px",
    });
  });
};

window.handleToastShare = function () {
  chrome.storage.sync.get("extensionShareToastCount", function (data) {
    let launchCount = data.extensionShareToastCount || 0;
    launchCount++;
    chrome.storage.sync.set({
      extensionShareToastCount: launchCount,
    });

    if (launchCount <= 3 || launchCount % 10 == 0) {
      // Show banner after 3 launches
      window.showToastShare();
    }
  });
};

window.generateTable = function (container, data) {
  container.empty();
  let table_container = $($(container.find("table tbody tr"))[1]);
  //table_container.empty();

  let parent_container = container.closest("tr");
  parent_container.find("td").css({
    height: "fit-content",
    padding: "0px",
    "padding-right": "0.5px",
  });
  $("#ACE_SSR_CLSRSLT_WRK_GROUPBOX1 td").css("height", "fit-content");

  if (generateTableInContainerWithData(container, data)) {
    // create popup
    setTimeout(window.handleToastShare, 3000);
  }
};

window.toggleContainers = function (container, isActive) {
  let new_container = $(container).find(".betterknightsui-new-container");
  let old_container = $(container).find(".betterknightsui-old-container");
  if (new_container.length == 0 || old_container.length == 0) return;

  new_container.css("display", isActive ? "block" : "none");
  old_container.css("display", !isActive ? "block" : "none");
};

window.replaceBrokenImages = function (containerEl) {
  // keyed by "from" URL
  const replacements = {
    "https://my.ucf.edu/cs/CSPROD/cache2/PS_CS_STATUS_WAITLIST_ICN_3.JPG": {
      to: "https://csprod-ss.net.ucf.edu/cs/CSPROD/cache2/PS_CS_STATUS_WAITLIST_ICN_3.JPG",
      label: "Wait List",
    },
    "https://my.ucf.edu/cs/CSPROD/cache2/PS_CS_STATUS_CLOSED_ICN_1.gif": {
      to: "https://csprod-ss.net.ucf.edu/cs/CSPROD/cache2/PS_CS_STATUS_CLOSED_ICN_1.gif",
      label: "Closed",
    },
    "https://my.ucf.edu/cs/CSPROD/cache2/PS_CS_STATUS_OPEN_ICN_1.gif": {
      to: "https://csprod-ss.net.ucf.edu/cs/CSPROD/cache2/PS_CS_STATUS_OPEN_ICN_1.gif",
      label: "Open",
    },
  };

  if (!containerEl) return;

  $(containerEl)
    .find("img")
    .each(function () {
      var $img = $(this);
      var abs = this.src || "";
      var raw = $img.attr("src") || "";

      // find matching key by absolute or raw src
      var from = replacements[abs] ? abs : replacements[raw] ? raw : null;
      if (!from) return;

      var conf = replacements[from];

      // swap the image
      if (conf.to && abs !== conf.to) {
        $img.attr("src", conf.to);
      }

      // append the label directly after the image
      if (conf.label) {
        $("<div/>", {
          text: conf.label,
          style: "text-align:center;margin-top:4px;",
        }).insertAfter($img);
      }
    });
};

var clicked = false;
window.handleTable = function (idx, container, isActive) {
  let new_container = $(container).find(".betterknightsui-new-container");
  let old_container = $(container).find(".betterknightsui-old-container");
  window.replaceBrokenImages(old_container);

  if (new_container.length > 0 && old_container.length > 0) {
    window.toggleContainers(container, isActive);
  } else if (isActive) {
    if (idx > 0) $(container).css("margin-top", "20px");
    $(container).children("table:first").css("width", "100%");
    $('div[id^="win0divSSR_CLSRSLT_WRK_GROUPBOX2GP"]').css({
      color: "#ab5b1a",
      "font-family": "Arimo",
      "font-size": "14px",
      "font-weight": "700",
      padding: "5px",
      "text-align": "center",
    });
    $(".PSHYPERLINK").each(function () {
      // Check if the element has either "PTCOLLAPSE_ARROW" or "PTEXPAND_ARROW"
      if (
        !$(this).hasClass("betterknightsui-arrow") &&
        ($(this).hasClass("PTCOLLAPSE_ARROW") ||
          $(this).hasClass("PTEXPAND_ARROW"))
      ) {
        // Remove any image inside the element
        $(this).find("img").remove();

        // Determine the correct icon based on the class
        let iconClass = $(this).hasClass("PTCOLLAPSE_ARROW")
          ? "fa-caret-down"
          : "fa-caret-up";

        // Create the FontAwesome icon element
        let icon = $("<i class='fas " + iconClass + "'></i>");

        // Apply CSS styles to the icon
        icon.css({
          color: "#ab5b1a",
          "margin-right": "2px",
          "font-size": "16px",
        });

        // Append the icon to the current element
        $(this).append(icon);
        $(this).addClass("betterknightsui-arrow");
      }
    });
    //Create new
    let rows = $(container).find(
      'div[id^="win0divSSR_CLSRSLT_WRK_GROUPBOX3$"]'
    );
    if (rows.length == 0) return;

    let data = [];
    rows.each(function (idx) {
      let row_data = window.extractDataFromTableRow(this);
      if (row_data != null) {
        data.push(row_data);
      }
    });
    if (data == null) return null;

    // Find the child container
    let child_container = $(container).find(
      $('table[id^="ACE_SSR_CLSRSLT_WRK_GROUPBOX2$"]')
    );
    if (child_container.length == 0) return;

    let modifiable_container = $(child_container[0]);

    // Copy modifiable_container and wrap it into "betterknightsui-old-container"
    let copy_container = modifiable_container.clone(); // Clone the original table
    copy_container.wrap('<div class="betterknightsui-old-container"></div>'); // Wrap the cloned container

    // Append the wrapped copy container to the container (or wherever you want)
    $(container).append(copy_container.parent());

    // Modify the original container
    window.generateTable(modifiable_container, data);

    // Wrap the modified container into "betterknightsui-new-container"
    modifiable_container.wrap(
      '<div class="betterknightsui-new-container"></div>'
    );

    window.toggleContainers(container, isActive);
  }
};

window.renameAndReorderCourseNumberOptions = function (
  courseNumberDropdown,
  course_number
) {
  const course_number_text =
    '"' + (!course_number ? "[Course Number]" : course_number) + '"';

  // Assign data-id attributes only if they don't exist
  courseNumberDropdown.find("option").each(function () {
    const option = $(this);
    const text = option.text().trim();

    if (!option.attr("data-id")) {
      switch (text) {
        case "is exactly":
          option.attr("data-id", "exact");
          break;
        case "greater than or equal to":
          option.attr("data-id", "greater_equal");
          break;
        case "less than or equal to":
          option.attr("data-id", "less_equal");
          break;
        case "contains":
          option.attr("data-id", "contains");
          break;
      }
    }
  });

  // Update option texts based on data-id attributes to make the purpose clear
  courseNumberDropdown.find("option").each(function () {
    const option = $(this);
    const id = option.attr("data-id");

    switch (id) {
      case "exact":
        option.text("Classes with Course Number EXACTLY " + course_number_text);
        break;
      case "greater_equal":
        option.text(
          "Classes with Course Number " + course_number_text + " or HIGHER"
        );
        break;
      case "less_equal":
        option.text(
          "Classes with Course Number " + course_number_text + " or LOWER"
        );
        break;
      case "contains":
        option.text(
          "Classes with Course Number CONTAINING " + course_number_text
        );
        break;
    }
  });

  // Reorder options based on data-id order
  const reorderedOptions = [
    courseNumberDropdown.find("option[data-id='exact']"),
    courseNumberDropdown.find("option[data-id='greater_equal']"),
    courseNumberDropdown.find("option[data-id='less_equal']"),
    courseNumberDropdown.find("option[data-id='contains']"),
  ];

  // Append reordered options back to the dropdown
  reorderedOptions.forEach((option) => {
    courseNumberDropdown.append(option);
  });

  // Set the first option (empty) as selected
  courseNumberDropdown.find("option:first").prop("selected", true);
};

window.prettifyElementsInsideSearchClassFilterMainContainer = function (
  container
) {
  // Prevent duplicate cards
  if ($(container).find("#betterknightsui_card").length > 0) return;

  // Create a Bootstrap card container for the form
  const card = $(
    "<div class='card shadow-sm border-light p-2' id='betterknightsui_card'></div>"
  );
  card.css({
    margin: "10px",
    "margin-left": "5%",
    width: "600px",
  });

  const cardBody = $('<div class="card-body"></div>');
  card.append(cardBody);

  const card_container = $("<div class='container'></div>");
  const container_row = $("<div class='row'></div>");

  const column_left = $("<div class='col'></div>");
  column_left.css({
    "border-right": "2px #f9fafb solid",
  });

  const column_right = $("<div class='col'></div>");

  container_row.append(column_left);
  container_row.append(column_right);
  container_row.append($('<div class="w-100"></div>'));

  card_container.append(container_row);
  const container_row_last = $("<div class='row'></div>");
  container_row_last.css({
    "margin-top": "16px",
  });
  card_container.append(container_row_last);

  // Add column title
  let title = $('<h5 class="card-title mb-3 my-card-title">Search</h5>');
  column_left.append(title);

  title = $('<h5 class="card-title mb-3 my-card-title">Advanced</h5>');
  column_right.append(title);

  // Helper function to create a row with a label and move input/select elements into it
  function createRow(labelText, inputElement) {
    const row = $(`
            <div class="mb-2">
                <label class="form-label mb-1">${labelText}</label>
            </div>
        `);
    row.append(inputElement); // Move the existing element into the row
    return row;
  }

  // Move elements into the card body, relative to the container

  // Button: "select subject"
  const selectSubjectButton = $(container).find(
    "input[id^='CLASS_SRCH_WRK2_SSR_PB_SUBJ_SRCH']"
  );
  selectSubjectButton.remove(); // No one uses that shit

  // Text input: "Subject"
  const subjectInput = $(container)
    .find("input[id^='SSR_CLSRCH_WRK_SUBJECT']")
    .addClass("form-control");
  subjectInput
    .attr("placeholder", "BSC 2010")
    .addClass("betterknightsui-placeholder");
  column_left.append(createRow("Subject", subjectInput));

  // Dropdown: "Location"
  const locationDropdown = $(container)
    .find("select[id^='SSR_CLSRCH_WRK_LOCATION']")
    .addClass("form-select");
  column_right.append(createRow("Location", locationDropdown));

  // Dropdown: "Course Number Filter"
  const courseNumberDropdown = $(container)
    .find("select[id^='SSR_CLSRCH_WRK_SSR_EXACT_MATCH1']")
    .addClass("form-select");
  column_right.append(
    createRow("Course Number Condition", courseNumberDropdown)
  );

  // Text input: "Course Number"
  const courseNumberInput = $(container)
    .find("input[id^='SSR_CLSRCH_WRK_CATALOG_NBR']")
    .addClass("form-control");
  column_left.append(createRow("Course Number", courseNumberInput));

  window.renameAndReorderCourseNumberOptions(
    courseNumberDropdown,
    courseNumberInput.val()
  );

  // Text input: "Course Keyword"
  const courseKeywordInput = $(container)
    .find("input[id^='SSR_CLSRCH_WRK_DESCR']")
    .addClass("form-control");
  column_right.append(createRow("Course Keyword", courseKeywordInput));

  // Dropdown: "Course Career"
  const courseCareerDropdown = $(container)
    .find("select[id^='SSR_CLSRCH_WRK_ACAD_CAREER']")
    .addClass("form-select");
  courseCareerDropdown.val("UGRD");
  column_left.append(createRow("Course Career", courseCareerDropdown));

  // Dropdown: "Special Course Group"
  const specialCourseGroupDropdown = $(container)
    .find("select[id^='ATTR_VAL']")
    .addClass("form-select");
  column_right.append(
    createRow("Special Course Group", specialCourseGroupDropdown)
  );

  // Checkbox: "Show Open Classes Only"
  const showOpenClassesOnlyCheckbox = $(container)
    .find("input[type='checkbox'][id^='SSR_CLSRCH_WRK_SSR_OPEN_ONLY']")
    .addClass("form-check-input");
  const showOpenClassesOnlyCheckboxHidden = $(container).find(
    "input[type='hidden'][id^='SSR_CLSRCH_WRK_SSR_OPEN_ONLY']"
  );
  if (showOpenClassesOnlyCheckbox.is(":checked"))
    showOpenClassesOnlyCheckbox.click();

  const showOpenClassesOnlyLabel = $(`
        <label class="form-check-label ms-1" for="${showOpenClassesOnlyCheckbox.attr(
          "id"
        )}">Show Open Classes Only</label>
    `);
  showOpenClassesOnlyLabel.css({
    "align-self": "center",
    "font-size": "14px",
  });
  const badge_open_html =
    '<span class="badge badge-green" style="font-size: 0.7rem;">OPEN</span>';
  showOpenClassesOnlyLabel.html(
    showOpenClassesOnlyLabel.html().replace("Open", badge_open_html)
  );
  const checkboxContainer = $('<div class="mb-2"></div>');
  const checkboxRow = $('<div class="row"></div>');
  const checkboxColumnLeft = $('<div class="col" style="flex: 0"></div>');
  const checkboxColumnRight = $(
    '<div class="col" style="display: flex; padding-left: 0px;"></div>'
  );
  checkboxColumnLeft.append(showOpenClassesOnlyCheckbox);
  checkboxColumnLeft.append(showOpenClassesOnlyCheckboxHidden);
  checkboxColumnRight.append(showOpenClassesOnlyLabel);
  checkboxRow.append(checkboxColumnLeft);
  checkboxRow.append(checkboxColumnRight);
  checkboxRow.css({
    "margin-top": "30px",
  });
  checkboxContainer.append(checkboxRow);

  // Button "Search"
  let searchButton = $(container)
    .closest("#ACE_DERIVED_CLSRCH_GROUP2")
    .find("#win0divCLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH");
  let searchButtonClone = searchButton.clone();
  let searchButtonInput = $(searchButtonClone).find("input");
  searchButtonInput
    .addClass("btn btn-primary w-100 mb-2")
    .css("font-weight", "bold")
    .unwrap();
  searchButtonInput.css({
    "font-weight": "normal",
    "max-width": "100%",
  });
  $(searchButtonClone)
    .find("a")
    .removeClass("PSPUSHBUTTON")
    .removeClass("Left");
  container_row_last.append(searchButtonClone);

  column_left.append(checkboxContainer);
  cardBody.append(card_container);

  $(container).empty();
  // Append the styled card to the container
  $(container).append(card);

  // Apply additional styling to the card and form elements
  $(container).css({
    "background-color": "#f9fafb",
    padding: "10px",
    "border-radius": "10px",
  });

  card.css({
    "background-color": "#ffffff",
    border: "1px solid #e3e6eb",
    "border-radius": "8px",
  });

  cardBody.find(".form-label").css({
    "font-weight": "600",
    color: "#333",
  });

  cardBody.find("input, select, button").css({
    "border-radius": "4px",
    padding: "6px 8px",
    "font-size": "14px",
    width: "100%",
  });
  showOpenClassesOnlyCheckbox.css({
    width: "25px",
    height: "25px",
    margin: "0px",
    padding: "0px",
  });

  subjectInput.on("input", function () {
    let value = subjectInput.val().trim();

    // Regular expression to match "3 letters + optional space + 4 numbers"
    let match = value.match(/^([a-zA-Z]{3})\s?(\d{4})$/);

    if (match) {
      // Extract the letters and numbers from the match
      let letters = match[1].toUpperCase();
      let numbers = match[2];

      // Set the values of subjectInput and courseNumberInput
      subjectInput.val(letters);
      courseNumberInput.val(numbers);
      searchButtonInput.focus();
      window.renameAndReorderCourseNumberOptions(
        courseNumberDropdown,
        courseNumberInput.val()
      );
    }
  });
  courseNumberInput.on("input", function () {
    window.renameAndReorderCourseNumberOptions(
      courseNumberDropdown,
      courseNumberInput.val()
    );
  });

  subjectInput.focus();
};

window.prettifyClassSearchFilterContainer = function (isActive) {
  let main_container = $("#win0divDERIVED_CLSRCH_SSR_GROUP_BOX_1\\$0");

  //warp original content inside the toggle container

  if (isActive) {
    // Copy modifiable_container and wrap it into "betterknightsui-old-container"

    //main_container.wrapInner('<div class="betterknightsui-old-container"></div>'); // Wrap the cloned container
    //const original_container = main_container.find(".betterknightsui-old-container");

    //const new_container = $('<div class="betterknightsui-new-container"></div>');
    //main_container.append(new_container);
    //new_container.append(original_container.clone());

    window.prettifyElementsInsideSearchClassFilterMainContainer(main_container);

    //window.toggleContainers(main_container, isActive);
  }
};

window.closePopupIfPresent = function () {
  // Check if the main div with id="ptModTable_0" exists and contains the specified child elements
  const ptModTable = $("[id^='ptModTable_']");

  if (ptModTable.length) {
    const popupTextSpan = ptModTable.find("#alertmsg .popupText");

    // Check if the span's text includes the specified string
    if (
      popupTextSpan.length &&
      popupTextSpan.text().includes("Students who are F-1 and J-1")
    ) {
      // Hide the popup
      //ptModTable.hide(); // Example action to hide the popup
      let btn = $("#okbutton").find("input");
      btn.click();
    }
  }
};

window.extensionEnabled = false;

window.myscan = function () {
  window.checkExtensionState();

  if (window.getWindowClassSearchTableContainer() != null) {
    let tables = $('div[id^="win0divSSR_CLSRSLT_WRK_GROUPBOX2$"]');
    if (tables.length == 0) return;
    tables.each(function (i) {
      window.handleTable(i, this, extensionEnabled);
    });

    if (extensionEnabled) {
      $("#win0divDERIVED_REGFRM1_DESCR1").each(function () {
        // Remove the closest parent <tr> element
        $(this).closest("tr").remove();
      });
    }
  }
  if (window.getWindowClassSearchFilterContainer() != null) {
    window.prettifyClassSearchFilterContainer(extensionEnabled);
  }
  if (extensionEnabled) {
    window.closePopupIfPresent();
  }
};

window.checkExtensionState = function () {
  try {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get("extensionEnabled", function (data) {
        let _extensionEnabled =
          data.extensionEnabled !== undefined ? data.extensionEnabled : true;
        if (_extensionEnabled !== window.extensionEnabled) {
          window.extensionEnabled = _extensionEnabled;
        }
      });
    }
  } catch (ex) {}
};

$(document).ready(function () {
  $("head").append(
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">'
  );
  $("head").append(
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">'
  );
  $("head").append(
    '<link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css">'
  );
  $("head").append(
    '<link rel="preconnect" href="https://fonts.googleapis.com">'
  );
  $("head").append(
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  );
  $("head").append(
    '<link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,100..900;1,100..900&family=Arimo:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">'
  );

  window.myscan();
  setInterval(window.myscan, 200);

  window.checkExtensionState();
});
