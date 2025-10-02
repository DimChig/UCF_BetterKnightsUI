window.levenshtein = function (a, b) {
  const matrix = [];
  let i, j;

  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Initialize the matrix
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      const substitutionCost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + substitutionCost // Substitution
      );
    }
  }

  return matrix[b.length][a.length];
};

async function fetchProfessorRatingsFromBackground(name) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "fetchProfessorRatings",
        professorName: name,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError); // Handle error from the extension system
        }

        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      }
    );
  });
}

async function fetchProfessorSigleRatingFromBackground(url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "fetchProfessorSigleRatingFromBackground",
        url: url,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError); // Handle error from the extension system
        }

        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.data);
        }
      }
    );
  });
}

async function parseRateMyProfessorData(rawProfessorName, data) {
  if (!data || !data.data || !data.data.search || !data.data.search.teachers)
    return;

  var professors = [];
  const edges = data.data.search.teachers.edges;
  for (let edge of edges) {
    const teacher = edge.node;

    // Extracting fields into separate variables
    const id = teacher.id;
    const firstName = teacher.firstName;
    const lastName = teacher.lastName;
    const avgRating = teacher.avgRating;
    const numRatings = teacher.numRatings;
    const avgDifficulty = teacher.avgDifficulty;
    const department = teacher.department;
    const url =
      "https://www.ratemyprofessors.com/professor/" + teacher.legacyId;

    // Constructing new object
    professors.push({
      id: id,
      firstName: firstName,
      lastName: lastName,
      avgRating: avgRating,
      numRatings: numRatings,
      avgDifficulty: avgDifficulty,
      department: department,
      url: url,
    });
  }

  if (professors.length == 0) return;

  // Find matching professor
  const professorData = getMatchingProfessor(rawProfessorName, professors);
  if (!professorData || professorData.numRatings <= 0) return;

  // GET ACTUAL DATA
  let real_html = await fetchProfessorSigleRatingFromBackground(
    professorData.url
  );
  if (real_html && real_html.length > 100) {
    //let real_html = await getProfessorRealRatings(professorData.url);
    var parsedHTML = $($.parseHTML(real_html));
    professorData.avgRating = parseFloat(
      $(parsedHTML.find("[class^='RatingValue__Numerator']")[0]).text().trim()
    );
    professorData.numRatings = parseInt(
      $(parsedHTML.find("[class^='RatingValue__NumRatings'] a")[0])
        .text()
        .split(" ")[0]
        .trim()
    );
    return professorData;
  }
  return null;
}

async function initRateMyProfessorFetch(professorName) {
  try {
    let data = await fetchProfessorRatingsFromBackground(professorName);
    let teacher_data = await parseRateMyProfessorData(professorName, data);

    // UPDATE ALL THE ELEMENTS ON THE PAGE
    updateAllElementsWithProfName(professorName, teacher_data);
  } catch (error) {
    console.error("Error fetching professor data:", error);
  }
}
