document.addEventListener("DOMContentLoaded", function () {
  const linkInput = document.getElementById("linkInput");
  const titleInput = document.getElementById("titleInput");
  const descriptionInput = document.getElementById("descriptionInput");
  const tagInput = document.getElementById("tagInput");
  const searchInput = document.getElementById("searchInput");
  const saveBtn = document.getElementById("saveBtn");
  const linkList = document.getElementById("linkList");
  const saveEditBtn = document.getElementById("saveEditBtn");

  let links = JSON.parse(localStorage.getItem("links")) || [];
  let problemData;

  async function fetchProblemData() {
    try {
      const response = await fetch("problem_data.json");
      problemData = await response.json();
    } catch (error) {
      console.error("Error fetching problem data:", error);
    }
  }

  fetchProblemData();

  function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  function getWebsiteIcon(url) {
    const domain = new URL(url).hostname.replace("www.", "");
    return `https://www.google.com/s2/favicons?domain=${domain}`;
  }

  function renderLinks(filter = "") {
    linkList.innerHTML = "";
    links
      .filter(
        (link) =>
          link.title.toLowerCase().includes(filter.toLowerCase()) ||
          link.description.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .forEach((link, index) => {
        const row = document.createElement("tr");
        const titleCell = document.createElement("td");
        const descriptionCell = document.createElement("td");
        const tagCell = document.createElement("td");
        const linkCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const actionCell = document.createElement("td");

        titleCell.textContent = link.title;
        descriptionCell.textContent = link.description;
        tagCell.textContent = link.tag;
        dateCell.textContent = link.dateAdded;

        const linkIcon = document.createElement("img");
        linkIcon.src = getWebsiteIcon(link.url);
        linkIcon.alt = "Website Icon";
        linkIcon.classList.add("website-icon");

        const linkBtn = document.createElement("a");
        linkBtn.href = link.url;
        linkBtn.target = "_blank";
        linkBtn.appendChild(linkIcon);

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.classList.add("btn", "btn-danger", "btn-sm", "mx-1");
        removeBtn.onclick = () => {
          links.splice(index, 1);
          localStorage.setItem("links", JSON.stringify(links));
          renderLinks(searchInput.value);
        };

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("btn", "btn-info", "btn-sm");
        editBtn.onclick = () => {
          showEditModal(link, index);
        };

        linkCell.appendChild(linkBtn);
        actionCell.appendChild(editBtn);
        actionCell.appendChild(removeBtn);

        row.appendChild(titleCell);
        row.appendChild(descriptionCell);
        row.appendChild(tagCell);
        row.appendChild(linkCell);
        row.appendChild(dateCell);
        row.appendChild(actionCell);

        linkList.appendChild(row);
      });
  }

  function showEditModal(link, index) {
    const editTitleInput = document.getElementById("editTitleInput");
    const editDescriptionInput = document.getElementById(
      "editDescriptionInput"
    );
    const editTagInput = document.getElementById('editTagInput');
    const tagInput = document.getElementById('tagInput');

    // Clear existing options in the edit modal's select
    editTagInput.innerHTML = '';

    // Copy options from the tagInput to editTagInput
    Array.from(tagInput.options).forEach(option => {
        const newOption = option.cloneNode(true);
        newOption.selected = option.value === link.tag;  // Set selected based on the current link's tag
        editTagInput.appendChild(newOption);
    });


    editTitleInput.value = link.title;
    editDescriptionInput.value = link.description;

    $("#editModal").modal("show");

    saveEditBtn.onclick = function () {
      const editedTitle = editTitleInput.value.trim();
      const editedDescription = editDescriptionInput.value.trim();
      const editedTag = editTagInput.value;

      console.log(editedTag)

      if (editedTitle && editedDescription) {
        links[index].title = editedTitle;
        links[index].description = editedDescription;
        links[index].tag = editedTag[0].toUpperCase() + editedTag.slice(1);
        localStorage.setItem("links", JSON.stringify(links));
        renderLinks(searchInput.value);
        $("#editModal").modal("hide");
      }
    };
  }

  saveBtn.addEventListener("click", () => {
    const input = linkInput.value.trim();
    let url;
    let title = titleInput.value.trim();
    let description = descriptionInput.value.trim();
    let tag = tagInput.value;
    let dateAdded = getCurrentDateTime();

    // Check if input is a LeetCode problem ID
    if (problemData && problemData[input]) {
      const {
        "Problem Name": problemName,
        "Acceptance Rate": acceptanceRate,
        Difficulty: difficulty,
      } = problemData[input];
      title = problemName;
      description = `${difficulty}`;
      url = `https://leetcode.com/problems/${problemName
        .toLowerCase()
        .replace(/ /g, "-")}/`;
    } else {
      url = input; // Treat input as a regular URL
    }

    if (url && title && description) {
      const link = {
        url,
        title,
        description,
        tag,
        dateAdded,
      };

      links.push(link);
      localStorage.setItem("links", JSON.stringify(links));
      renderLinks(searchInput.value);
    }

    linkInput.value = "";
    titleInput.value = "";
    descriptionInput.value = "";
  });

  searchInput.addEventListener("input", () => {
    renderLinks(searchInput.value);
  });

  renderLinks();
});
