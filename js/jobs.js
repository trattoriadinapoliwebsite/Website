const JOBS_API = "https://script.google.com/macros/s/AKfycbzxm41GdKBBvqy2U5gWT5tAC3_VHpS3WD4aAUhs6kdKbX6u_ZO0A5vWgVmvOIFvcRwZ/exec";
let openings = [];
let selectedPosition = null;
document.addEventListener("DOMContentLoaded", () => {
  loadOpenings();
  document
    .getElementById("application-form")
    .addEventListener(
      "submit",
      submitApplication
    );
});
async function loadOpenings() {
  try {
    const response = await fetch(
      `${JOBS_API}?action=getOpenings`
    );
    openings = await response.json();
    renderJobs();
    renderPositionSelector();
  } catch(error) {
    console.error(error);
    showToast(
      "Unable to load openings."
    );
  }
}
function renderJobs() {
  const container =
  document.getElementById("job-list");
  container.innerHTML = "";
  openings.forEach(job => {
    const card =
    document.createElement("div");
    card.className =
    "job-card";
    card.innerHTML = `
      <h3>${job.title}</h3>
      <div class="job-meta">
        <span class="job-tag">
          ${job.department}
        </span>
        <span class="job-tag">
          ${job.employmentOptions}
        </span>
      </div>
      <p>
        ${job.description || ""}
      </p>
      <p>
        <strong>
          Wage:
        </strong>
        ${job.wage}
      </p>
    `;
    card.addEventListener(
      "click",
      () => {
        selectPosition(job);
        document
          .querySelector(".application-section")
          .scrollIntoView({
            behavior:"smooth"
          });
      }
    );
    container.appendChild(card);
  });
}
function renderPositionSelector() {
  const container =
    document.getElementById(
      "position-selector"
    );
  openings.forEach(job => {
    container.innerHTML += `
    <label class="option-card">
      <input
        type="radio"
        name="position"
        value="${job.positionId}"
      >
      <span>
        ${job.title}
      </span>
    </label>
    `;
  });
  container
  .querySelectorAll("input")
  .forEach(input => {
    input.addEventListener(
      "change",
      () => {
        const job =
        openings.find(
          item =>
          item.positionId === input.value
        );
        selectPosition(job);
      }
    );
  });
}
function selectPosition(job) {
  selectedPosition = job;
  document
  .querySelectorAll(".job-card")
  .forEach(card =>
    card.classList.remove("selected")
  );
  renderSelector(
    "employment-selector",
    "employment-container",
    job.employmentOptions
  );
  renderSelector(
    "schedule-selector",
    "schedule-container",
    job.scheduleOptions
  );
}
function renderSelector(
  element,
  container,
  options
) {
  const selector =
  document.getElementById(element);
  const wrapper =
  document.getElementById(container);
  selector.innerHTML = "";
  const values =
  options
  .split(",")
  .map(v => v.trim());
  if(values.length <= 1) {
    wrapper.classList.add("hidden");
    return;
  }
  wrapper.classList.remove("hidden");
  values.forEach(value => {
    selector.innerHTML += `
    <label class="option-card">
      <input
        type="radio"
        name="${element}"
        value="${value}"
        required
      >
      <span>
        ${value}
      </span>
    </label>
    `;
  });
}
async function submitApplication(e) {
  e.preventDefault();
  if(!selectedPosition) {
    showToast(
      "Please select a position."
    );
    return;
  }
  const form =
  e.target;
  const file =
  document.getElementById("resume")
  .files[0];
  const data = {
    firstName:
    form.firstName.value,
    lastName:
    form.lastName.value,
    email:
    form.email.value,
    phone:
    form.phone.value,
    positionId:
    selectedPosition.positionId,
    employmentType:
    getSelected("employment-selector"),
    schedulePreference:
    getSelected("schedule-selector"),
    experienceLevel:
    form.experienceLevel.value,
    resume:
    file
    ?
    await convertFile(file)
    :
    null
  };
  try {
    const response =
    await fetch(
      JOBS_API,
      {
        method:"POST",
        body:
        JSON.stringify({
          action:
          "submitApplication",
          ...data
        })
      }
    );
    const result =
    await response.json();
    if(result.success) {
      showToast(
        "Application submitted!"
      );
      form.reset();
    }
  } catch(error) {
    console.error(error);
    showToast(
      "Submission failed."
    );
  }
}
function getSelected(name) {
  const input =
  document.querySelector(
    `input[name="${name}"]:checked`
  );
  return input
  ?
  input.value
  :
  "";
}
function convertFile(file) {
  return new Promise(resolve => {
    const reader =
    new FileReader();
    reader.onload = () => {
      resolve({
        name:file.name,
        mimeType:file.type,
        data:
        reader.result
        .split(",")[1]
      });
    };
    reader.readAsDataURL(file);
  });
}
function showToast(message) {
  const toast =
  document.getElementById("toast");
  toast.textContent =
  message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  },3000);


}
