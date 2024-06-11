const linkInput = document.getElementById('linkInput');
const titleInput = document.getElementById('titleInput');
const descriptionInput = document.getElementById('descriptionInput');
const saveBtn = document.getElementById('saveBtn');
const linkList = document.getElementById('linkList');

let links = JSON.parse(localStorage.getItem('links')) || [];
let problemData;

async function fetchProblemData() {
  try {
    const response = await fetch('problem_data.json');
    problemData = await response.json();
  } catch (error) {
    console.error('Error fetching problem data:', error);
  }
}

fetchProblemData();

function getWebsiteIcon(url) {
  const domain = new URL(url).hostname.replace('www.', '');
  const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}`;
  return iconUrl;
}

function renderLinks() {
  linkList.innerHTML = '';
  links.forEach((link, index) => {
    const row = document.createElement('tr');
    const titleCell = document.createElement('td');
    const descriptionCell = document.createElement('td');
    const linkCell = document.createElement('td');
    const actionCell = document.createElement('td');

    titleCell.textContent = link.title;
    descriptionCell.textContent = link.description;

    const linkIcon = document.createElement('img');
    linkIcon.src = getWebsiteIcon(link.url);
    linkIcon.alt = 'Website Icon';
    linkIcon.classList.add('website-icon');

    const linkBtn = document.createElement('a');
    linkBtn.href = link.url;
    linkBtn.target = '_blank';
    linkBtn.appendChild(linkIcon);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('btn', 'btn-danger', 'btn-sm');
    removeBtn.addEventListener('click', () => {
      links.splice(index, 1);
      localStorage.setItem('links', JSON.stringify(links));
      renderLinks();
    });

    linkCell.appendChild(linkBtn);
    actionCell.appendChild(removeBtn);

    row.appendChild(titleCell);
    row.appendChild(descriptionCell);
    row.appendChild(linkCell);
    row.appendChild(actionCell);

    linkList.appendChild(row);
  });
}

saveBtn.addEventListener('click', async () => {
  const input = linkInput.value.trim();
  let url;
  let title;
  let description;

  // Check if input is a LeetCode problem ID
  if (problemData && problemData[input]) {
    const { 'Problem Name': problemName, 'Acceptance Rate': acceptanceRate, Difficulty: difficulty } = problemData[input];
    title = problemName;
    description = `Acceptance Rate: ${acceptanceRate}%, Difficulty: ${difficulty}`;
    url = `https://leetcode.com/problems/${problemName.toLowerCase().replace(/ /g, '-')}/`;
  } else {
    // Treat input as a regular URL
    url = input;
    title = titleInput.value.trim();
    description = descriptionInput.value.trim();
  }

  if (url && title && description) {
    const link = {
      url,
      title,
      description
    };

    links.push(link);
    localStorage.setItem('links', JSON.stringify(links));
    renderLinks();

    linkInput.value = '';
    titleInput.value = '';
    descriptionInput.value = '';
  }
});

renderLinks();