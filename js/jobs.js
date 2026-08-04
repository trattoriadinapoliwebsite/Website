const JOBS_API = "https://script.google.com/macros/s/AKfycbwyNdmEqcCq_SmXUhxtfQH1fYlB40A_y8adF7DAAX5akvXZWSH9W7Nnyq59Xo_bkiWQ/exec";
let openings = [];
let selectedPosition = null;
let expandedJob = null;
document.addEventListener("DOMContentLoaded", () => {
  loadOpenings();
  document.getElementById("application-form").addEventListener("submit", submitApplication);
  const startButton = document.getElementById("start-application");
  if(startButton) {
    startButton.addEventListener("click", () => {scrollToApplication();});
  }
});
async function loadOpenings() {
  try {
    const response = await fetch(`${JOBS_API}?action=getOpenings`);
    openings = await response.json();
    renderJobs();
    renderPositionSelector();
  } catch(error) {
    console.error(error);
    showToast("Unable to load openings.");
  }
}
function renderJobs() {
  const container =document.getElementById("job-list");
  container.innerHTML = "";
  openings.forEach(job => {
    const card = document.createElement("article");
    card.className = "job-card";
    card.innerHTML = `
      <div class="job-card-header">
        <div>
          <h3>${job.title}</h3>
          <div class="job-meta">
            <span class="job-tag">${job.department}</span>
            <span class="job-tag">${job.employmentOptions}</span>
            <span class="job-tag">${job.scheduleOptions}</span>
          </div>
        </div>
        <button type="button" class="expand-icon" aria-label="Expand position">
          ❯
        </button>
      </div>
      <div class="job-summary">
        <p>${job.shortDescription}</p>
        <p><strong>Starting Pay:</strong>${job.wage}</p>
      </div>
      <div class="job-details">
        <h4>Position Details</h4>
        <p>${job.fullDescription}</p>
        <h4>Requirements</h4>
        <p>${job.requirements}</p>
        <button class="btn apply-position"> Apply For This Position </button>
      </div>
    `;
    const header = card.querySelector(".job-card-header");
    const expandButton = card.querySelector(".expand-icon");
    expandButton.addEventListener("click", event => {
      event.stopPropagation();
      toggleJob(card);
    });
    const applyButton = card.querySelector(".apply-position");
    applyButton.addEventListener("click", (event) => {
        event.stopPropagation();
        selectPosition(job);
        scrollToApplication();
      }
    );
    container.appendChild(card);
  });
}
function toggleJob(card) {
  if(expandedJob && expandedJob !== card) {
    expandedJob.classList.remove("expanded");
  }
  const expanded = card.classList.contains("expanded");
  if(expanded) {
    card.classList.remove("expanded");
    expandedJob = null;
  } else {
    card.classList.add("expanded");
    expandedJob = card;
  }
}
function renderPositionSelector() {
  const container = document.getElementById("position-selector");
  container.innerHTML = "";
  openings.forEach(job => {
    container.innerHTML += `
      <label class="option-card">
        <input type="radio" name="position" value="${job.positionId}" required>
        <span>${job.title}</span>
      </label>`;
  });
  container.querySelectorAll( "input")
    .forEach(input => {
      input.addEventListener( "change", () => {
          const job = openings.find( item => item.positionId === input.value);
          selectPosition(job);
        }
      );
    });
}
function selectPosition(job) {
  if(!job) return;
  selectedPosition = job;
  const radio = document.querySelector(`input[name="position"][value="${job.positionId}"]`);
  if(radio) {
    radio.checked =
      true;
  }
  renderSelector("employment-selector", "employment-container", job.employmentOptions, "employmentType");
  renderSelector("schedule-selector", "schedule-container", job.scheduleOptions, "schedulePreference");
}
function renderSelector( element, container, options, name) {
  const selector = document.getElementById(element);
  const wrapper = document.getElementById(container);
  selector.innerHTML = "";
  const values = options.split(",").map(value =>value.trim());
  wrapper.classList.remove("hidden");
  if(values.length === 1) {
    selector.innerHTML = `<input type="hidden" name="${name}"value="${values[0]}"><span class="job-tag">${values[0]}</span>`;
    return;
  }
  values.forEach(value => {
    selector.innerHTML += `
      <label class="option-card"><input type="radio" name="${name}" value="${value}" required><span>${value}</span></label>`;
  });
}
async function submitApplication(e) {
  e.preventDefault();
  const form = e.target;
  if(!validateForm()) {
    return;
  }
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Submitting...";
  const file = document.getElementById("resume").files[0];
  const data = {
    firstName:
      form.firstName.value.trim(),
    lastName:
      form.lastName.value.trim(),
    email:
      form.email.value.trim(),
    phone:
      form.phone.value.trim(),
    positionId:
      selectedPosition.positionId,
    employmentType:
      getSelected("employmentType"),
    schedulePreference:
      getSelected("schedulePreference"),
    experienceLevel:
      getSelected("experienceLevel"),
    resume:
      await convertFile(file)
  };
  try {
    const response = await fetch(`${JOBS_API}?action=submitApplication`, {
          method:"POST",
          body:
            JSON.stringify(data)
        }
      );
    const result = await response.json();
    if(result.success) {
      showToast("Application submitted!");
      form.reset();
      selectedPosition = null;
    } else {
      showToast( result.message || "Submission failed.");
    }
  } catch(error) {
    console.error(error);
    showToast("Submission failed.");
  }
  button.disabled = false;
  button.textContent = "Submit Application";
}
function validateForm() {
  const form = document.getElementById("application-form");
  const file = document.getElementById("resume").files[0];
  if(!selectedPosition) {
    showToast("Please select a position.");
    return false;
  }
  if( !form.email.value.match( /^[^\s@]+@[^\s@]+\.[^\s@]+$/ )) {
    showToast("Please enter a valid email.");
    return false;
  }
  if( !form.phone.value.match(/^[0-9()\-\s+]{7,}$/)) {
    showToast("Please enter a valid phone number.");
    return false;
  }
  if(!getSelected("experienceLevel")) {
    showToast("Please select experience level.");
    return false;
  }
  if(!file) {
    showToast("Resume is required.");
    return false;
  }
  const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
  if(!allowed.includes(file.type)) {
    showToast("Only PDF or Word files accepted.");
    return false;
  }
  if(file.size > 5000000) {
    showToast("Resume must be under 5MB.");
    return false;
  }
  return true;
}
function getSelected(name) {
  const input = document.querySelector(`input[name="${name}"]:checked`);
  return input
    ? input.value : document.querySelector(`input[name="${name}"][type="hidden"]`)?.value || "";
}
function convertFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name:
          file.name,
        mimeType:
          file.type,
        data:
          reader.result
            .split(",")[1]
      });
    };
    reader.readAsDataURL(file);
  });
}
function scrollToApplication() {
  document.querySelector(".application-section")
    .scrollIntoView({
      behavior:"smooth"
    });
}
function showToast(message) {
  const toast =document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
      toast.classList.remove("show");
    },
    3000
  );
}
