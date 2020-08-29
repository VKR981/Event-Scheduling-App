var selection = [null, null];
var events = [
  {
    title: 'document.querySelector("textarea").value',
    type: "Work",
    start_date: new Date("12/2/2020,00:00:00"),
    end_date: new Date("12/2/2020,00:30:00"),
  },
];

document.addEventListener("DOMContentLoaded", function () {
  fill_dates();
  addtimepicker(".firsttimepicker");

  document.querySelectorAll("select").forEach((e) => {
    e.onchange = ondatechange;
  });
  document.querySelector(".submitevent").onclick = handlesubmit;
  document.querySelector(".clearlist").onclick = clearlist;
  document.querySelector(".clearmodal").onclick = clearmodal;
  updateshcedule();
});

//adds days(1-31) options to <select> and sets default date to todays date
function fill_dates() {
  document.querySelectorAll(".day").forEach((day) => {
    day.innerHTML = "";
    for (let i = 1; i < 32; i++) {
      op = document.createElement("option");
      op.innerHTML = i;
      day.append(op);
    }
  });

  date = new Date();
  document.querySelectorAll(".day").forEach((day) => {
    day[date.getDate() - 1].setAttribute("selected", "selected");
  });
  document.querySelectorAll(".month").forEach((month) => {
    month[date.getMonth() + 1].setAttribute("selected", "selected");
  });
  document.querySelectorAll(".year").forEach((year) => {
    for (i = 0; i < year.length; i++) {
      if (year[i].innerHTML == date.getFullYear()) {
        year[i].setAttribute("selected", "selected");
      }
    }
  });
}

//handles datechange, adds second timepicker if event takes more than one day
function ondatechange() {
  document
    .querySelector(".eventtype")
    .setAttribute(
      "class",
      `form-control eventtype ${document
        .querySelector(".eventtype")
        .value.toLowerCase()}`
    );
  if (
    document.querySelectorAll(".day")[0].value ==
      document.querySelectorAll(".day")[1].value &&
    document.querySelectorAll(".month")[0].value ==
      document.querySelectorAll(".month")[1].value &&
    document.querySelectorAll(".year")[0].value ==
      document.querySelectorAll(".year")[1].value
  ) {
    addtimepicker(".firsttimepicker");
    document.querySelector(".secondtimepicker").innerHTML = "";
    document.querySelector(".secondtimepickertitle").innerHTML = "";
  } else {
    addtimepicker(".secondtimepicker");
    addtimepicker(".firsttimepicker");
    document.querySelector(".secondtimepickertitle").innerHTML =
      "Pick ending time";
  }
}

//generates time picker //issue has same index
function addtimepicker(cls) {
  let i = 0;
  if (cls == ".firsttimepicker") {
    i = 0;
  } else if (cls == ".secondtimepicker") {
    i = 1;
  }
  let s = new Date(
    `${document.querySelectorAll(".day")[i].value}/${
      document.querySelectorAll(".month")[i].value
    }/${document.querySelectorAll(".year")[i].value} 00:00:00`
  );

  timeOptions = {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  };
  document.querySelector(cls).innerHTML = "";
  for (i = 0; i < 48; i++) {
    let buttonprop = 'class="btn btn-light timebutton" data-disabled=false';
    if (checkifused(s)[0]) {
      buttonprop =
        'class="btn btn-primary timebutton" disabled data-disabled=true';
    }
    document.querySelector(
      cls
    ).innerHTML += `<button type="button" data-time='${s.toLocaleString()}' ${buttonprop} style="width: 100px" data-toggle="button" aria-pressed="false">${s.toLocaleString(
      "en-US",
      (options = timeOptions)
    )}</button>`;
    s = new Date(s.getTime() + (3600 / 2) * 1000);
  }
  addbuttonlistener();
}

//handles time picker clicking, colors it and stores selected times in selection[] array
function addbuttonlistener() {
  let flag = 0;

  document.querySelectorAll(".timebutton").forEach((button, i) => {
    let timebuttons = document.querySelectorAll(".timebutton");
    button.onclick = function () {
      if (flag == 0) {
        selection[0] = i;
        flag = 1;
      } else {
        selection[1] = i;
        flag = 0;
      }

      for (j = 0; j <= timebuttons.length - 1; j++) {
        if (timebuttons[j].dataset.disabled != "true") {
          timebuttons[j].setAttribute("class", "btn btn-light timebutton");
          timebuttons[selection[0]].setAttribute(
            "class",
            "btn btn-primary timebutton"
          );
        }
      }

      for (j = selection[0]; j <= selection[1]; j++) {
        timebuttons[j].setAttribute("class", "btn btn-primary timebutton");
      }
    };
  });
}

//handles add event button, appends new event from form to events array and refreshes schedule list
function handlesubmit() {
  if (
    document.querySelector("textarea").value == "" ||
    selection[0] == null ||
    selection[1] == null
  ) {
    alert("Please choose/fill all the fields");
    return 0;
  }
  let s = get_times()[0];
  let e = get_times()[1];
  for (i = s; i < e; ) {
    j = i;
    check = checkifused(i);
    if (check[0]) {
      alert(`event overlap with ${check[1] + 1}`);
      return 0;
    }

    i = new Date(j.getTime() + (3600 / 2) * 1000);
  }

  events.push({
    title: document.querySelector("textarea").value,
    type: document.querySelector(".eventtype").value,
    start_date: s,
    end_date: e,
  });

  updateshcedule();
  document.querySelector(".closemodal").click();
  fill_dates();
  ondatechange();
  selection = [null, null];
}

//Compares events, used for sorting
function compareevents(a, b) {
  if (a.start_date.getTime() > b.start_date.getTime()) {
    return 1;
  } else {
    return -1;
  }
}

//clears schedule list and events array
function clearlist() {
  let eventslist = document.querySelector(".eventslist");
  eventslist.innerHTML = "";
  events = [];
  updateshcedule();
  clearmodal();
}

//Updates/refreshes schedule list

function updateshcedule() {
  let eventslist = document.querySelector(".eventslist");
  eventslist.innerHTML = "";
  events.sort(compareevents);
  timeOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  };
  for (i = 0; i < events.length; i++) {
    eventslist.innerHTML += `<li class="list-group-item eventitem ${events[
      i
    ].type.toLowerCase()}">
  ${events[i].start_date.toLocaleDateString(
    "en-US",
    timeOptions
  )}   To   ${events[i].end_date.toLocaleDateString("en-US", timeOptions)}
  <div class='eventrow'><h5>${i + 1}. ${
      events[i].title
    }</h5>  <button type="button" onClick=delete_event(${i}) class="btn btn-primary delete_event">
  Delete
</button></div>
</li>`;
  }
}

//deletes events
function delete_event(i) {
  events = events.filter((value, index) => {
    return index != i;
  });
  updateshcedule();
  clearmodal();
}

//get 2 times from <select>
function get_times() {
  s = new Date(
    document.querySelectorAll(".timebutton")[selection[0]].dataset.time
  );
  e = new Date(
    document.querySelectorAll(".timebutton")[selection[1]].dataset.time
  );
  return [s, e];
}

//checks if provided time falls between events already scheduled
function checkifused(s) {
  for (i = 0; i < events.length; i++) {
    if (events[i].start_date <= s && events[i].end_date >= s) {
      return [true, i];
    }
  }
  return [false, 0];
}

//clears modals fields
function clearmodal() {
  document.querySelector("textarea").value = "";
  selection = [null, null];
  fill_dates();
  ondatechange();
}
