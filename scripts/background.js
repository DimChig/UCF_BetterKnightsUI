chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchProfessorRatings") {
        fetchProfessorRatings(message.professorName)
            .then(data => sendResponse({
                data
            }))
            .catch(error => sendResponse({
                error: error.message
            }));
    } else if (message.action === "fetchProfessorSigleRatingFromBackground") {
        fetchProfessorSingleRatings(message.url)
            .then(data => sendResponse({
                data
            }))
            .catch(error => sendResponse({
                error: error.message
            }));
    }

    // Indicate that the listener will respond asynchronously
    return true;
});

// Existing fetchProfessorRatings function
async function fetchProfessorRatings(name) {
    if (!name || name.length < 3 || name.toLowerCase().includes("announced") || name.toLowerCase() === ("tba")) {
        return null;
    }

    const url = "https://www.ratemyprofessors.com/graphql";
    const jsonData = {
        'query': 'query TeacherSearchResultsPageQuery($query: TeacherSearchQuery!, $schoolID: ID, $includeSchoolFilter: Boolean!) { search: newSearch { ...TeacherSearchPagination_search_1ZLmLD } school: node(id: $schoolID) @include(if: $includeSchoolFilter) { __typename ... on School { name } id } } fragment TeacherSearchPagination_search_1ZLmLD on newSearch { teachers(query: $query, first: 8, after: "") { didFallback edges { cursor node { ...TeacherCard_teacher id __typename } } pageInfo { hasNextPage endCursor } resultCount filters { field options { value id } } } } fragment TeacherCard_teacher on Teacher { id legacyId avgRating numRatings ...CardFeedback_teacher ...CardSchool_teacher ...CardName_teacher ...TeacherBookmark_teacher } fragment CardFeedback_teacher on Teacher { wouldTakeAgainPercent avgDifficulty } fragment CardSchool_teacher on Teacher { department school { name id } } fragment CardName_teacher on Teacher { firstName lastName } fragment TeacherBookmark_teacher on Teacher { id isSaved }',
        'variables': {
            'query': {
                'text': name.toLowerCase(),
                'schoolID': 'U2Nob29sLTEwODI=',
                'fallback': true,
                'departmentID': null
            },
            'schoolID': 'U2Nob29sLTEwODI=',
            'includeSchoolFilter': true
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": "Basic dGVzdDp0ZXN0", // Base64 encoded "test:test"
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    });

    if (!response.ok) {
        throw new Error(`Error fetching professor ratings: ${response.statusText}`);
    }

    return response.json();
}



// Existing fetchProfessorRatings function
async function fetchProfessorSingleRatings(url) {

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Basic dGVzdDp0ZXN0", // Base64 encoded "test:test"
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Error fetching professor ratings: ${response.statusText}`);
    }

    return response.text();
}

// Define the getProfessorRealRatings function
async function getProfessorRealRatings(url) {
    return new Promise((resolve, reject) => {
        fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": "Basic dGVzdDp0ZXN0", // Base64 encoded "test:test"
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                if (response.status >= 200 && response.status < 400) {
                    resolve(response.text());
                } else {
                    reject(new Error("Error fetching data: " + response.status));
                }
            })
            .catch(() => {
                reject(new Error("Request failed"));
            });
    });
};