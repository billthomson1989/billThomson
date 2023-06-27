// Global Variables
var currentLocations = [];
var currentDepartments = [];

let firstName_toggle = true;
let lastName_toggle = true;
let email_toggle = true;
let jobTitle_toggle = true;
let department_toggle = true;
let location_toggle = true;

toastr.options = {
    "preventDuplicates": true
  };

$(window).on('load', function(){
    $('#preloader').fadeOut('slow', function() {
        $(this).remove();
    });
});

// Main AJAX & jQuery Code
$(function(){

    getAllUsers();

    // --------------------------------------------------------- Users ---------------------------------------------------------
    
    // New function to update the user list
function updateUserList() {
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getUser.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {
            let data = results["data"];
            let userArray = [];
            let user_html = ``;

            for(let i=0; i < data.length; i++){
                userArray.push(data[i]);
            }

            for(let i=0; i < userArray.length; i++){
                // Modify the following line to match your user list HTML structure
                user_html += `<tr id="${userArray[i].id}" class="tableRow" ... ></tr>`;
            }

            $('#userList').html(user_html); // Replace 'userList' with the ID of the element containing the user list
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log('Raw response:', jqXHR.responseText); // Log the raw response data
            console.log('Error:', errorThrown);
        }
    });
}
    
    // User Modal Behaviour
    $('table').on('click', '.tableRow', function() {

    var current_user;
    current_user = this.id
    console.log(current_user)

    $("#userSelectModal").modal('show'); 

    // Generate specific user details
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getPersonnelByID.php",
        data: {
            id: current_user
        },
        dataType: 'json',
        async: false,
        success: function(results) {

            // Extract user details from the response
            const data = results["data"]
            const returned_user = data.personnel['0'];
            
            // Populate the modal with user details
            $('#userSelectModalLabel').html(`${returned_user.firstName} ${returned_user.lastName}`);
            $('#user_id').val(returned_user.id);
            $('#user_firstName').val(returned_user.firstName);
            $('#user_lastName').val(returned_user.lastName);
            $('#user_email').val(returned_user.email);
            $('#user_jobTitle').val(returned_user.jobTitle);
            $('#user_department').val(returned_user.department);
            $('#user_location').val(returned_user.location);
            
            // Set the user ID for the edit button
            $("#edit").attr("userID", returned_user.id);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

        
        // Delete User
    $("#delete").click(function() {
        $("#userDeleteModal").modal('show');
        $('#deleteConfirm').html(`${$('#userSelectModalLabel').html()}<br>`);
    })

    $(`#delUserConfirm`).on('click', event => {
        var userID = $('#user_id').val();

        $.ajax({
            type: 'POST',
            url: "./libs/php/deleteUserByID.php",
            data: {
                id: userID,
            },
            dataType: 'json',
            async: false,
            success: function(results) {
                // Remove deleted user from the table
                updateUserList();
                $(`#${userID}`).remove();
                $("#userDeleteModal").modal('hide');
                $('#deleteConfirm').html("");
                toastr.success('Deletion Successful!');
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })
    })

    })

    // Edit User
    $("#edit").click(function() {

        $("#userEditModal").modal('show');
        $('.modal-backdrop').show(); // Show the grey overlay.

        // Generate specific user details
        $.ajax({
            type: 'GET',
            url: "../companydirectory/libs/php/getPersonnelByID.php",
            data: {
                id: $("#edit").attr("userID")
            },
            dataType: 'json',
            async: false,
            success: function(results) {

                const data = results["data"]
                const returned_user = data.personnel['0'];

                $('#edit_user_firstName').val(returned_user.firstName);
                $('#edit_user_lastName').val(returned_user.lastName);
                $('#edit_user_email').val(returned_user.email);
                $('#edit_user_jobTitle').val(returned_user.jobTitle);
                $('#edit_user_department').html(returned_user.department);
                $('#edit_user_location').html(returned_user.location);
                $("#editUserConfirm").attr("userID", returned_user.id);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })

        getDepartmentsByUser();

        let departmentSelection = "";
        for (i = 0; i < currentDepartments.length; i++) {
            if (currentDepartments[i].department == $('#edit_user_department').html()) {
                departmentSelection += `<option value="${currentDepartments[i].id}" selected="selected">${currentDepartments[i].department}</option>`
            } else {
                departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
            }
        }

        $('#edit_user_department').html(departmentSelection);

        $("#edit_user_department").change(function() {

            let locationSelectionHTML = "";
            let locationID = document.getElementById('edit_user_department').value;

            for (let i = 0; i < currentDepartments.length; i++) {
                if (currentDepartments[i]['id'] == locationID) {
                    locationSelectionHTML = `${currentDepartments[i]['location']}`
                }
            }

            $('#edit_user_location').html(locationSelectionHTML);
        })

    });

    // Confirm Edit User -> PHP Routine
$("#editUserForm").submit(function(e) {
    e.preventDefault();
    e.stopPropagation();

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/updateUser.php",
        data: {
            firstName: $('#edit_user_firstName').val(),
            lastName: $('#edit_user_lastName').val(),
            email: $('#edit_user_email').val(),
            jobTitle: $('#edit_user_jobTitle').val(),
            departmentID: $('#edit_user_department').val(),
            id: $("#editUserConfirm").attr("userID")
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            const userID = $("#editUserConfirm").attr("userID");
            // Update edited user in the table
            $(`#${userID} td:nth-child(1)`).text($('#edit_user_lastName').val()); // Update last name in the first column
            $(`#${userID} td:nth-child(2)`).text($('#edit_user_firstName').val()); // Update first name in the second column
            $(`#${userID} td:nth-child(3)`).text($('#edit_user_email').val());
            $(`#${userID} td:nth-child(4)`).text($('#edit_user_jobTitle').val());
            $(`#${userID} td:nth-child(5)`).text($('#edit_user_department option:selected').text());
            $(`#${userID} td:nth-child(6)`).text($('#edit_user_location').text());
            $("#userEditModal").modal('hide');
            $('.modal-backdrop').hide(); // Hide the grey overlay.
            // Update the user list with the updated data
            updateUserList();
            toastr.success('Update complete!');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});


    // Add User Modal
    $(`#addUser`).on('click', event => {
        
        $('.modal-backdrop').show(); // Show the grey overlay.

        getDepartmentsByUser();
        let departmentSelection = ``;

        for(i=0; i<currentDepartments.length; i++){
            departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
        }

        $('#add_user_department').html(departmentSelection);

        function updateLocation(){
            let locationSelectionHTML = "";
            let locationID = document.getElementById('add_user_department').value;
            
            for(let i=0; i < currentDepartments.length; i++){
                if (currentDepartments[i]['id'] == locationID){
                    locationSelectionHTML = `${currentDepartments[i]['location']}`
                }
            }
            
            $('#add_user_location').html(locationSelectionHTML);
        }

        updateLocation();

        $("#add_user_department").change(function(){
            updateLocation();
        })

    });

    // Confirm Add User -> PHP Routine
$("#newUserForm").submit(function(e) {

    e.preventDefault();
    e.stopPropagation();

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/insertUser.php",
        data: {
            firstName: $('#add_user_firstName').val(),
            lastName: $('#add_user_lastName').val(),
            email: $('#add_user_email').val(),
            jobTitle: $('#add_user_jobTitle').val(),
            departmentID: $('#add_user_department').val()
        },
        dataType: 'json',
        async: false,
        success: function(result) {
            let newUserFirstName = $('#add_user_firstName').val();
            let newUserLastName = $('#add_user_lastName').val();
            let newUserEmail = $('#add_user_email').val();
            let newUserJobTitle = $('#add_user_jobTitle').val();
            let newUserDepartmentID = $('#add_user_department').val();
            let newUserDepartmentName = $('#add_user_department option:selected').text();
            let newUserLocation = currentDepartments.find(dept => dept.id === newUserDepartmentID).location;
        
            let html_row = `<tr>
    <td>${newUserLastName}</td>
    <td>${newUserFirstName}</td>
    <td>${newUserEmail}</td>
    <td>${newUserJobTitle}</td>
    <td>${newUserDepartmentName}</td>
    <td>${newUserLocation}</td>
    <td><button class="editUserBtn btn btn-warning"><i class="fas fa-pencil-alt"></i></button></td>
    <td><button class="deleteUserBtn btn btn-danger"><i class="fa fa-trash"></i></button></td>

</tr>`;
            $("#mainTable").append(html_row);
        
            $('#addUserModal').modal('hide');
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            toastr.success('User Added Successfully!');
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
});

    // --------------------------------------------------------- Departments ---------------------------------------------------------

    // Function to update the department list
        function updateDepartmentList() {
        $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getAllDepartments.php", // Replace this with the appropriate API URL for fetching department data
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {
            let data = results["data"];
            let depArray = [];
            let dep_html = ``;

            for(let i=0; i < data.length; i++){
                depArray.push(data[i]);
            }

            for(let i=0; i < depArray.length; i++){
                // Modify the following line to match your department list HTML structure
                dep_html += `<tr id="${depArray[i].id}" class=" depTableRow" ... ></tr>`;
            }

            $('#departmentsList').html(dep_html); // Replace 'departmentsList' with the ID of the element containing the department list
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

    // Department Modal Behaviour
$(`#departments`).on('click', event => {

    // Initially update the department list when the modal is opened
    updateDepartmentList();

        $('.modal-backdrop').show(); // Show the grey overlay.
        generateDepartmentList();

        $("#addDepartment").click(function(){      
            
            document.getElementById('newDepName').value = "";
            getLocations();

            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
            }

            $('#newDepLocation').html(locationSelection);

        });

        // Edit Department       
        $('#departmentsList').on('click', '.depTableRow', function() {
            
            $('.modal-backdrop').show(); // Show the grey overlay.

            $('#editDepName').val(`${this.title}`);
            $('#editDepForm').attr("depID", `${this.attributes.departmentID.value}`);
            
            var depID = this.id;
            var locID = this.attributes.location.value;
            
            if (this.attributes.users.value == 0){
                $("#deleteDepBtn").show();
                $("#departmentDelete").attr("departmentName",this.attributes.title.value);
                $("#departmentDelete").attr("departmentID",this.attributes.departmentID.value);
            } else {
                $("#deleteDepBtn").hide();
            }

            getLocations();
            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                
                if(currentLocations[i].id == locID){
                    locationSelection += `<option value="${currentLocations[i].id}" selected="selected">${currentLocations[i].location}</option>`
                }
                else {
                    locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
                }
            }

            $('#editDepLocation').html(locationSelection);

        });

        // Confirm Edit Department -> PHP Routine
$("#editDepForm").submit(function(e) {

    e.preventDefault();
    e.stopPropagation();

    let editDepName = $('#editDepName').val();
    let depLocationID = $('#editDepLocation').val();
    let depID = this.attributes.depID.value

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/updateDepartment.php",
        data: {
            name: editDepName,
            locationID: depLocationID,
            departmentID: depID
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            // Find the corresponding row in the table
            let row = $('tr[departmentID="' + depID + '"]');

            // Update the department name in the row
            row.find('td:first').text(editDepName);

            // Update the location ID in the row
            row.attr('location', depLocationID);

            toastr.success('Update Successful!');
            // Hide the modal and remove the backdrop
            $('#departmentEditModal').modal('hide');
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    }) 
})

        // Delete Department
        $("#departmentDelete").unbind("click").click(function(){      
    
            $('.modal-backdrop').show(); // Show the grey overlay.
            $('#delDepName').html(`${this['attributes']['departmentName']['value']}`);

            var depID = this.attributes.departmentID.value;
            
            $("#delDepConfirm").click(function(){ 
                var depIDInt = parseInt(depID)
                
                $.ajax({
                    type: 'POST',
                    url: "../companydirectory/libs/php/deleteDepartmentByID.php",
                    data: {
                        id: depIDInt,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                        updateDepartmentList();
                        toastr.success('Deletion Successful!');
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                })
                
            })
        });

    });

    

    // Add Department -> PHP Routine
$("#addDepForm").submit(function(e) {

    e.preventDefault();
    e.stopPropagation();

    let newDepName = $('#newDepName').val();
    let newLocId = $('#newDepLocation').val();
    let newLocName = $('#newDepLocation option:selected').text();

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/insertDepartment.php",
        data: {
            name: newDepName,
            locationID: newLocId
        },
        dataType: 'json',
        async: false,
        success: function(result) {
            let html_row = `<tr class="depTableRow" title="${newDepName}" departmentID="${result.id}" location="${newLocId}" users="0">
                <td>${newDepName}</td>
                <td>${newLocName}</td>
                <td><button class="editDepartmentBtn btn btn-warning"><i class="fas fa-pencil-alt"></i></button></td>
                <td><button class="deleteDepBtn btn btn-danger"><i class="fa fa-trash"></i></button></td>

            </tr>`;
            $("#mainTable").append(html_row);

            // Hide the modal and remove the backdrop
            $('#addDepartmentModal').modal('hide');
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            toastr.success('Department Added Successfully!');
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

})

    // --------------------------------------------------------- Locations ---------------------------------------------------------

    // Function to update the locations list
function updateLocationsList() {
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getLocations.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {
            let data = results["data"];
            let locArray = [];
            let loc_html = ``;

            for(let i=0; i < data.length; i++){
                locArray.push(data[i]);
            }

            for(let i=0; i < locArray.length; i++){
                loc_html += `<tr id="${locArray[i].id}" class=" locationEdit locTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#locationEditModal" locationName="${locArray[i].location}" locationID="${locArray[i].id}" departments="${locArray[i].departments}"><td scope="row" class="locationHeader">${locArray[i].location}</td></tr>`;
            }

            $('#locationsList').html(loc_html);
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

// Location Modal Behaviour
$(`#locations`).on('click', event => {

    // Initially update the locations list when the modal is opened
    updateLocationsList();



        // Edit Location Modal
        $(".locationEdit").click(function(){      
            
            $('.modal-backdrop').show();

            $('#edit_location_name').val(this.attributes.locationName.value);
            $('#edit_location_name').attr("locID", this.attributes.locationID.value);
        
            if (this.attributes.departments.value == 0){
                $("#deleteLocBtn").show();
                $("#locationDelete").attr("locationName",this.attributes.locationName.value);
                $("#locationDelete").attr("locationID",this.attributes.locationID.value);
            } else {
                $("#deleteLocBtn").hide();
            }
        
        });

        // Delete Location -> PHP Routine
        $("#locationDelete").off("click").on("click", function(){
            
            $('#delLocName').html(`${this['attributes']['locationName']['value']}`);

            var locID = this.attributes.locationID.value;
            
            $("#delLocForm").submit(function(e) {

                e.preventDefault();
                e.stopPropagation();

                $.ajax({
                    type: 'POST',
                    url: "../companydirectory/libs/php/deleteLocationByID.php",
                    data: {
                        locationID: locID,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                        toastr.success('Deletion Successful!');
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                }) 
            })
        });
    });    


    // --------------------------------------------------------- Locations ---------------------------------------------------------

    // Function to update the locations list
function updateLocationsList() {
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getLocations.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {
            let data = results["data"];
            let locArray = [];
            let loc_html = ``;

            for(let i=0; i < data.length; i++){
                locArray.push(data[i]);
            }

            for(let i=0; i < locArray.length; i++){
                loc_html += `<tr id="${locArray[i].id}" class=" locationEdit locTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#locationEditModal" locationName="${locArray[i].location}" locationID="${locArray[i].id}" departments="${locArray[i].departments}"><td scope="row" class="locationHeader">${locArray[i].location}</td></tr>`;
            }

            $('#locationsList').html(loc_html);
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

// Location Modal Behaviour
$(`#locations`).on('click', event => {

    // Initially update the locations list when the modal is opened
    updateLocationsList();



        // Edit Location Modal
        $(".locationEdit").click(function(){      
            
            $('.modal-backdrop').show();

            $('#edit_location_name').val(this.attributes.locationName.value);
            $('#edit_location_name').attr("locID", this.attributes.locationID.value);
        
            if (this.attributes.departments.value == 0){
                $("#deleteLocBtn").show();
                $("#locationDelete").attr("locationName",this.attributes.locationName.value);
                $("#locationDelete").attr("locationID",this.attributes.locationID.value);
            } else {
                $("#deleteLocBtn").hide();
            }
        
        });

        // Delete Location -> PHP Routine
        $("#locationDelete").off("click").on("click", function(){
            
            $('#delLocName').html(`${this['attributes']['locationName']['value']}`);

            var locID = this.attributes.locationID.value;
            
            $("#delLocForm").submit(function(e) {

                e.preventDefault();
                e.stopPropagation();

                $.ajax({
                    type: 'POST',
                    url: "../companydirectory/libs/php/deleteLocationByID.php",
                    data: {
                        locationID: locID,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                        toastr.success('Deletion Successful!');
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                }) 
            })
        });
    });    

    // Edit Location -> PHP Routine
$("#editLocForm").submit(function(e) {
    e.preventDefault();
    e.stopPropagation();

    let editLocName = $('#edit_location_name').val();
    let locID = $('#edit_location_name').attr('locID');

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/updateLocation.php",
        data: {
            name: editLocName,
            locationID: locID
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            // Find the corresponding row in the table
            let row = $('button[locationID="' + locID + '"]').closest('tr');

            // Update the location name in the row
            row.find('td:first').text(editLocName);

            // Update the name attribute in the edit and delete buttons
            row.find('.editLocationBtn').attr('locationName', editLocName);
            row.find('.deleteLocBtn').attr('locationName', editLocName);

            toastr.success('Location Updated Successfully!');

            // Close the modal
            $('#locationEditModal').modal('hide');
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
})
            

    // Add Location - Modal
    $("#addLocation").click(function(){
        $('.modal-backdrop').show();
        $('#newLocName').val("");
    })

   // Add Location -> PHP Routine
$("#addLocForm").submit(function(e) {

    e.preventDefault();
    e.stopPropagation();

    let newLocName = $('#newLocName').val();

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/insertLocation.php",
        data: {
            name: newLocName,
        },
        dataType: 'json',
        async: false,
        success: function(result) {
            let html_row = `<tr>
                <td>${newLocName}</td>
                <td><button class="editLocationBtn locationEdit btn btn-warning" locationName="${newLocName}" locationID="${result.id}" departments="0">
                <i class="fas fa-pencil-alt"></i></button></td>
                <td><button class="deleteLocBtn locationDelete btn btn-danger" locationName="${newLocName}" locationID="${result.id}" departments="0">
                <i class="fa fa-trash"></i></button></td>
            </tr>`;
            $("#mainTable").append(html_row);

            // Hide the modal and remove the backdrop
            $('#addLocationModal').modal('hide');
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            toastr.success('Location Added Successfully!');
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

})
    // --------------------------------------------------------- Search Functions ---------------------------------------------------------
    
    // Search Functionality
function makeAjaxRequest(url) {
    $.ajax({
        type: 'GET',
        url: url,
        data: {
            search: "%" + document.getElementById("searchField").value + "%"
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            generateSearchResultsUsers(results);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            toastr.warning('No search results found');
            console.log(errorThrown);
        }
    });
}
$("#search").click(function() {
    $("#resetBtn").attr("style", "visibility: visible");
    var option = $('#searchSelect').val();

    // Select the 'personnel' tab
    $("#personnel-tab").click();

    if (option == 'firstName') {
        makeAjaxRequest("../companydirectory/libs/php/search_firstName.php");
    } else if (option == 'lastName') {
        makeAjaxRequest("../companydirectory/libs/php/search_lastName.php");
    } else if (option == 'email') {
        makeAjaxRequest("../companydirectory/libs/php/search_email.php");
    } else if (option == 'jobTitle') {
        makeAjaxRequest("../companydirectory/libs/php/search_jobTitle.php");
    } else if (option == 'department') {
        makeAjaxRequest("../companydirectory/libs/php/search_department.php");
    } else if (option == 'location') {
        makeAjaxRequest("../companydirectory/libs/php/search_location.php");
    }
});

// Reset button functionalit
$("#resetBtn").on('click', () => {
    $("#resetBtn").attr("style", "visibility: hidden");
    $("#searchField").val("");
    getAllUsers();
})

// Dynamic behaviour for searchBar
$(window).on('resize', function() {
    var win = $(this);
    if (win.width() < 1250) {
        $('#searchBar').removeClass('col-6');
        $('#searchBar').addClass('col-10');
    }
});

function generateSearchResultsUsers(results){
    let searchData = results["data"];
    let list = searchData['personnel'];

    var search_html_table = "";

  // Update Main HTML Table
  for (i = 0; i < list.length; i++) {
    search_html_table += `<tr class="tableRow" id="${list[i].id}">
        <td scope="row" class="col-12 col-sm-6 col-md-2">${list[i].lastName}</td>
        <td scope="row" class="col-12 col-sm-6 col-md-2">${list[i].firstName}</td>
        <td scope="row" class="d-none d-md-table-cell">${list[i].email}</td>
        <td scope="row" class="d-none d-xl-table-cell">${list[i].jobTitle}</td>
        <td scope="row" class="d-none d-xl-table-cell">${list[i].department}</td>
        <td scope="row" class="d-none d-xl-table-cell">${list[i].location}</td>
        <td><button class="editBtn btn btn-warning"><i class="fas fa-pencil-alt"></i></button></td>
        <td><button class="deleteUserBtn btn btn-danger"><i class="fa fa-trash"></i></button></td>
        </tr>`;
  }

if (search_html_table === "") {
    toastr.info('No Search Results Found');
} else {
    $('#sqlTable').find('tbody').html(`${search_html_table}`);
    toastr.success('Located Successfully!');
}
}

function handleScreenOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    if (isPortrait) {
        // Add vertical classes and remove horizontal classes
        document.querySelectorAll('#sqlTable th, #sqlTable td').forEach(cell => {
            cell.classList.add('col-12', 'col-sm-6');
            cell.classList.remove('col-md-4', 'col-lg-2');
        });
    } else {
        // Add horizontal classes and remove vertical classes
        document.querySelectorAll('#sqlTable th, #sqlTable td').forEach(cell => {
            cell.classList.add('col-md-4', 'col-lg-2');
            cell.classList.remove('col-12', 'col-sm-6');
        });
    }
}

// Call the function on page load
handleScreenOrientation();

// Add an event listener for screen orientation changes
window.matchMedia("(orientation: portrait)").addListener(handleScreenOrientation);

function fetchTableData(url, dataType, callback) {
    $.ajax({
        type: 'GET',
        url,
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {
            callback(results);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            toastr.warning('No search results found');
            console.log(errorThrown);
        }
    });
}

function getLocations() {
    fetchTableData("../companydirectory/libs/php/getLocations.php", 'json', function(results) {
        currentLocations = results["data"];
    });
}

function getDepartmentsByUser() {
    fetchTableData("../companydirectory/libs/php/getAllDepartments.php", 'json', function(results) {
        currentDepartments = results["data"];
        toastr.success('Departments retrieved successfully!');
    });
}

function generateDepartmentList() {
    fetchTableData("../companydirectory/libs/php/getAllDepartments.php", 'json', function(results) {
        let data = results["data"];
        let depArray = data.map(item => item);
        let dep_html = depArray.map(dep => `<tr id="${dep.id}" class=" departmentEdit depTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#departmentEditModal" title="${dep.department}" location="${dep.locationID}" users="${dep.users}" departmentID="${dep.id}"><td class="tableIcon"><i class="fas fa-building"></i></td><td scope="row" class="department"> ${dep.department} </td><td scope="row" class="department_location"> ${dep.location} </td>`).join('');
        $('#departmentsList').html(dep_html);
        toastr.success('Department List Generated Successfully!');
    });
}

function getAllUsers() {
    fetchTableData("../companydirectory/libs/php/getAll.php", 'json', function(results) {
      let data = results["data"];
      let usersArray = data.map(item => item);
      let html_table = usersArray.map(user => `<tr class="tableRow" id="${user.id}">
        <td scope="row" class="col-12 col-sm-6 col-md-4 col-lg-2">${user.lastName}</td>
        <td scope="row" class="col-12 col-sm-6 col-md-4 col-lg-2">${user.firstName}</td>
        <td scope="row" class="d-none d-md-table-cell col-md-4 col-lg-2">${user.email}</td>
        <td scope="row" class="d-none d-lg-table-cell col-lg-2">${user.jobTitle}</td>
        <td scope="row" class="d-none d-lg-table-cell col-lg-2">${user.department}</td>
        <td scope="row" class="d-none d-lg-table-cell col-lg-2">${user.location}</td>
        <td><button class="editUserBtn btn btn-warning"><i class="fas fa-pencil-alt"></i></button></td>
        <td><button class="deleteUserBtn btn btn-danger"><i class="fa fa-trash"></i></button></td>
      </tr>`).join('');
      $('#mainTable').html(html_table);
      $('#mainTable').removeClass('initiallyHidden').fadeIn('slow');
    });
  }
  
  function updateTableHeaders(tab) {
    const personnelHeaders = [
      "lastName",
      "firstName",
      "email",
      "jobTitle",
      "departmentHeader",
      "locationHeader",
      "editHeader",
      "deleteHeader",
    ];
    const departmentHeaders = ["departmentHeader", "locationHeader", "editHeader", "deleteHeader"];
    const locationHeaders = ["locationHeader", "editHeader", "deleteHeader"];
  
    let headers;
    if (tab === "personnel") {
      headers = personnelHeaders;
    } else if (tab === "department") {
      headers = departmentHeaders;
    } else if (tab === "location") {
      headers = locationHeaders;
    }
  
    // Reset classes for all headers
    $(".static-header th").attr("class", "");
  
    // Hide all headers first
    $(".static-header th").css("display", "none");
  
    // Show only the necessary headers
    headers.forEach((headerId) => {
      $("#" + headerId).css("display", "");
    });
  
    // Fade in the visible headers
    setTimeout(function () {
      $(".static-header").fadeIn("slow");
    }, 200);
  
    // Override display property for large screens for the department and location tabs
    if (tab === "department") {
      $("#email, #jobTitle").addClass("d-lg-none");
      $("#departmentHeader, #locationHeader").removeClass("d-none");
    } else if (tab === "location") {
      $("#email, #jobTitle, #departmentHeader").addClass("d-lg-none");
      $("#locationHeader").removeClass("d-none");
    }
  }
  
  // Add event listeners for tab clicks
  $("#personnel-tab").on("click", function () {
    // Hide the table data and headers
    $('#mainTable').hide();
    $(".static-header").hide();
  
    updateTableHeaders("personnel");
    getAllUsers();
  });
  
  $("#department-tab").on("click", function () {
    // Hide the table data and headers
    $('#mainTable').hide();
    $(".static-header").hide();
  
    updateTableHeaders("department");
    getDepartmentData();
  });
  
  $("#location-tab").on("click", function () {
    // Hide the table data and headers
    $('#mainTable').hide();
    $(".static-header").hide();
  
    updateTableHeaders("location");
    getLocationData();
  });
      
      
      
    // Function to get and display department data
    function getDepartmentData() {
        $.ajax({
            type: "GET",
            url: "../companydirectory/libs/php/getAllDepartments.php",
            data: {},
            dataType: "json",
            async: true,
            success: function (results) {
                let data = results["data"];
                let html_table = "";
    
                data.forEach((department) => {
                    html_table += `<tr class="depTableRow" title="${department.department}" departmentID="${department.id}" location="${department.locationID}" users="${department.users}">
                    <td>${department.department}</td>
                    <td>${department.location}</td>
                    <td><button class="editDepartmentBtn btn btn-warning"><i class="fas fa-pencil-alt"></i></button></td>
                    <td><button class="deletDepBtn btn btn-danger"><i class="fa fa-trash"></i></button></td>
                    </tr>`;
                });
    
                $("#mainTable").html(html_table);
                // Use fadeIn to smoothly display the data
                $("#mainTable").removeClass('initiallyHidden').fadeIn('slow');
    
                $("#mainTable").on('click', '.editDepartmentBtn', function(e) {
                e.stopPropagation();
            
                let depRow = $(this).closest('.depTableRow'); // Get the department row
                let depID = depRow.attr('departmentID');
                let locID = depRow.attr('location');
            
                $('.modal-backdrop').show(); // Show the grey overlay.
            
                // Adjust the attributes and values based on the row, not the button
                $('#editDepName').val(depRow.attr('title'));
                $('#editDepForm').attr("depID", depID);
                
                if (depRow.attr('users') == 0){
                    $("#deleteDepBtn").show();
                    $("#departmentDelete").attr("departmentName", depRow.attr('title'));
                    $("#departmentDelete").attr("departmentID", depID);
                } else {
                    $("#deleteDepBtn").hide();
                }

                // Fetch locations and update the select field in the edit modal
                getLocations();
                let locationSelection = "";
                for (i = 0; i < currentLocations.length; i++) {
                    if (currentLocations[i].id == locID) {
                        locationSelection += `<option value="${currentLocations[i].id}" selected="selected">${currentLocations[i].location}</option>`;
                    } else {
                        locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`;
                    }
                }
                $('#editDepLocation').html(locationSelection);

                // Show the edit modal
                $('#departmentEditModal').modal('show');
            });

            $('#mainTable').on('click', '.deletDepBtn', function(e) {
                e.stopPropagation();
            
                let depRow = $(this).closest('.depTableRow'); // Get the department row
                let depID = depRow.attr('departmentID'); // Get the department id
            
                $.ajax({
                    type: 'POST',
                    url: '../companydirectory/libs/php/checkDepartmentUse.php',
                    data: { id: depID },
                    dataType: 'json',
                    success: function (result) {
                        console.log('Inside success function');
                        console.log('Department count: ', result.data.departmentCount);
                        if (result.data.departmentCount > 0) {
                            console.log('Inside if condition');
                            // If there are personnel in the department, show the modal with the warning message
                            $('#delDepName').text(result.data.departmentName);
                            $('#delDepCount').text(result.data.departmentCount);
                            console.log('Before showing modal');
                            $('#deleteDepConfirmWithPersonnel').modal('show');
                            console.log('After showing modal');
                        } else {
                            // If there are no personnel in the department, show the confirmation delete modal
                            $('#delDepName').text(result.data.departmentName);
                            $('#delDepConfirm').data('depID', depID);
                            $('#departmentDeleteModal').modal('show');
                        }
                        $('.btn-close, .btn-secondary').on('click', function () {
                            $('.modal').modal('hide');
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(textStatus, errorThrown);
                    }
                });
            });

// Edit Department       
$('#departmentsList').on('click', '.depTableRow', function() {
            
    $('.modal-backdrop').show(); // Show the grey overlay.

    $('#editDepName').val(`${this.title}`);
    $('#editDepForm').attr("depID", `${this.attributes.departmentID.value}`);
    
    var depID = this.id;
    var locID = this.attributes.location.value;
    
    if (this.attributes.users.value == 0){
        $("#deleteDepBtn").show();
        $("#departmentDelete").attr("departmentName",this.attributes.title.value);
        $("#departmentDelete").attr("departmentID",this.attributes.departmentID.value);
    } else {
        $("#deleteDepBtn").hide();
    }

    getLocations();
    let locationSelection = "";
    for(i=0; i<currentLocations.length; i++){
        
        if(currentLocations[i].id == locID){
            locationSelection += `<option value="${currentLocations[i].id}" selected="selected">${currentLocations[i].location}</option>`
        }
        else {
            locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
        }
    }

    $('#editDepLocation').html(locationSelection);

});

// Confirm Edit Department -> PHP Routine
$("#editDepForm").submit(function(e) {

e.preventDefault();
e.stopPropagation();

let editDepName = $('#editDepName').val();
let depLocationID = $('#editDepLocation').val();
let depID = this.attributes.depID.value

$.ajax({
type: 'POST',
url: "../companydirectory/libs/php/updateDepartment.php",
data: {
    name: editDepName,
    locationID: depLocationID,
    departmentID: depID
},
dataType: 'json',
async: false,
success: function(results) {
    // Find the corresponding row in the table
    let row = $('tr[departmentID="' + depID + '"]');

    // Update the department name in the row
    row.find('td:first').text(editDepName);

    // Update the location ID in the row
    row.attr('location', depLocationID);

    toastr.success('Update Successful!');
    // Hide the modal and remove the backdrop
    $('#departmentEditModal').modal('hide');
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');
},

error: function(jqXHR, textStatus, errorThrown) {
    console.log(errorThrown);
}
}) 
})

$(document).on('click', '.editDepBtn', function() {
    // Populate the input field
    $('#edit_department_name').val(this.getAttribute('depName'));

    if (this.getAttribute('departments') == 0){
        $("#deleteLocBtn").show();
        $("#departmentDelete").attr("depName",this.getAttribute('depName'));
        $("#departmentDelete").attr("depID",this.getAttribute('depID'));
    } else {
        $("#deleteDepBtn").hide();
    }
    
    // Open the modal
    $('#departmentEditModal').modal('show');
});

$('#delDepConfirm').on('click', function(e) {
    let depID = $(this).data('depID'); // Get the department id

    $.ajax({
        type: 'POST',
        url: '../companydirectory/libs/php/deleteDepartmentByID.php', // Replace with the URL to your delete department script
        data: {
            id: depID
        },
        success: function (result) {
            // Check the result to see if the delete was successful
            if (result.status.name == "ok") {
                // If the delete was successful, refresh the department data
                getDepartmentData();
                // Show a success message
                toastr.success('Department successfully deleted.', 'Success!');
                // Close the modal
                $('#departmentDeleteModal').modal('hide');
            } else {
                // If there was an error, display it
                console.log(result.status.description);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // If there was an error with the request, display it
            console.log(textStatus, errorThrown);
        }
    });
});
}})};
        
 
function getLocationData() {
    $.ajax({
        type: "GET",
        url: "../companydirectory/libs/php/getLocations.php",
        dataType: "json",
        success: function (results) {
            let data = results["data"];
            let html_table = "";

            data.forEach((location) => {
                html_table += `<tr>
                    <td>${location.location}</td>
                    <td><button class="editLocationBtn locationEdit btn btn-warning" locationName="${location.location}" locationID="${location.id}" departments="${location.departments}"><i class="fas fa-pencil-alt"></i></button></td>
                    <td><button class="deleteLocBtn locationDelete btn btn-danger" locationName="${location.location}" locationID="${location.id}" departments="${location.departments}"><i class="fa fa-trash"></i></button></td>
                </tr>`;
            });

            $("#mainTable").html(html_table);
             // Use fadeIn to smoothly display the data
             $("#mainTable").removeClass('initiallyHidden').fadeIn('slow');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            toastr.warning("No search results found");
            console.log(errorThrown);
        }
    });
}

$(document).on('click', '.editLocationBtn', function() {
    // Populate the input field
    $('#edit_location_name').val(this.getAttribute('locationName'));
    $('#edit_location_name').attr("locID", this.getAttribute('locationID'));

    if (this.getAttribute('departments') == 0){
        $("#deleteLocBtn").show();
        $("#locationDelete").attr("locationName",this.getAttribute('locationName'));
        $("#locationDelete").attr("locationID",this.getAttribute('locationID'));
    } else {
        $("#deleteLocBtn").hide();
    }
    
    // Open the modal
    $('#locationEditModal').modal('show');
});
});

// Click event for delete button
$(document).on('click', '.deleteLocBtn', function() {
    // Get location id and name from the button
    let locID = $(this).attr('locationID');
    let locName = $(this).attr('locationName');
    
    // Check if the location has departments associated with it
    $.ajax({
        type: 'POST',
        url: '../companydirectory/libs/php/checkLocationUse.php',
        data: { id: locID },
        dataType: 'json',
        success: function (result) {
            console.log('Inside success function');
            console.log('Department count: ', result.data.departmentCount);
            if (result.data.departmentCount > 0) {
                console.log('Inside if condition');
                // If there are departments in the location, show the modal with the warning message
                $('#delLocName').text(result.data.locationName);
                $('#delLocCount').text(result.data.departmentCount);
                console.log('Before showing modal');
                $('#deleteLocConfirmWithDepartments').modal('show');
                console.log('After showing modal');
            } else {
                // If there are no departments in the location, show the confirmation delete modal
                $('#delLocNameConfirm').text(result.data.locationName);
                $('#delLocConfirm').data('locID', locID);
                $('#locationDeleteModal').modal('show');
            }
            $('.btn-close, .btn-secondary').on('click', function () {
                $('.modal').modal('hide');
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
});

// Event handler for delete confirmation
$('#delLocConfirmButton').off('click').on('click', function() {
    let locID = $('#delLocConfirm').data('locID'); // Get the location id

    $.ajax({
        type: 'POST',
        url: '../companydirectory/libs/php/deleteLocationByID.php', // Replace with the URL to your delete location script
        data: {
            locationID: locID,
        },
        dataType: 'json',
        async: false,
        success: function (results) {
            toastr.success('Deletion Successful!');
            // Manually remove the row from the table
            $('.deleteLocBtn[locationID="' + locID + '"]').closest('tr').remove();
            // Hide the modal
            $('#locationDeleteModal').modal('hide');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
})

// Click event for delete button
$(document).on('click', '.deleteLocBtn', function() {
    // Get location id from the button
    let locID = $(this).attr('locationID');
    let locName = $(this).attr('locationName');
    
    $.ajax({
        type: 'POST',
        url: '../companydirectory/libs/php/checkLocationUse.php',
        data: { id: locID },
        dataType: 'json',
        success: function (result) {
            if (result.data.departmentCount > 0) {
                // If there are departments in the location, show the modal with the warning message
                $('#delLocName').text(result.data.locationName);
                $('#delLocCount').text(result.data.departmentCount);
                $('#deleteLocConfirmWithDepartments').modal('show');
            } else {
                // If there are no departments in the location, show the confirmation delete modal
                $('#delLocName').text(result.data.locationName);
                $('#delLocConfirm').data('locID', locID);
                $('#locationDeleteModal').modal('show');
            }
            $('.btn-close, .btn-secondary').on('click', function () {
                $('.modal').modal('hide');
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
});

// Click event for delete confirmation button
$(document).on('click', '#delLocConfirm', function() {
    let locID = $(this).data('locID'); // Get the location id

    $.ajax({
        type: 'POST',
        url: '../companydirectory/libs/php/deleteLocationByID.php', // Replace with the URL to your delete location script
        data: {
            locationID: locID,
        },
        dataType: 'json',
        async: false,
        success: function (results) {
            toastr.success('Deletion Successful!');
            // Manually remove the row from the table
            $('.deleteLocBtn[locationID="' + locID + '"]').closest('tr').remove();
            // Hide the modal
            $('#locationDeleteModal').modal('hide');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
});


// Declare currentDepartments in the global scope
var currentDepartments; 

document.getElementById('addButton').addEventListener('click', function () {
    var activeTab = document.querySelector('.nav-tabs .active'); // This gets the currently active tab

    function updateLocation() {
        let locationSelectionHTML = "";
        let locationID = document.getElementById('add_user_department').value;

        $.ajax({
            type: 'GET',
            url: '../companydirectory/libs/php/getAllDepartments.php',
            dataType: 'json',
            async: false,
            success: function(result) {
                currentDepartments = result.data;

                for(let i=0; i < currentDepartments.length; i++){
                    if (currentDepartments[i]['id'] == locationID){
                        locationSelectionHTML = `${currentDepartments[i]['location']}`
                    }
                }

                $('#add_user_location').html(locationSelectionHTML);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    if (activeTab.id === 'personnel-tab') {
        var addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'), {});

        // When the modal is shown, populate the departments dropdown
        $('#addUserModal').on('shown.bs.modal', function () {
            // Fetch and populate the departments before showing the modal
            $('#add_user_department').empty(); // Clear existing options

            $.ajax({
                type: 'GET',
                url: '../companydirectory/libs/php/getAllDepartments.php',
                dataType: 'json',
                async: false,
                success: function(result) {
                    currentDepartments = result.data;

                    for(var i = 0; i < currentDepartments.length; i++) {
                        var option = $('<option/>');
                        option.attr('value', currentDepartments[i].id);
                        option.text(currentDepartments[i].department);
                        $('#add_user_department').append(option);
                    }
                    
                    // Call update location function here after departments have been populated.
                    updateLocation();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
        });

        addUserModal.show();
    } else if (activeTab.id === 'department-tab') {

        var addDepartmentModal = new bootstrap.Modal(document.getElementById('addDepartmentModal'), {});
        
        // When the modal is shown, populate the locations dropdown
        $('#addDepartmentModal').on('shown.bs.modal', function () {
            // Fetch and populate the locations before showing the modal
            $('#newDepLocation').empty(); // Clear existing options

            $.ajax({
                type: 'GET',
                url: '../companydirectory/libs/php/getLocations.php',
                dataType: 'json',
                async: false,
                success: function(result) {
                    var locations = result.data;

                    for(var i = 0; i < locations.length; i++) {
                        var option = $('<option/>');
                        option.attr('value', locations[i].id);
                        option.text(locations[i].location); // 'location' is the name of the property
                        $('#newDepLocation').append(option);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
        });

        addDepartmentModal.show();
    } else if (activeTab.id === 'location-tab') {
        var addLocationModal = new bootstrap.Modal(document.getElementById('addLocationModal'), {});
        addLocationModal.show();
    }

    $('#add_user_department').change(function () {
        updateLocation();
    });
});

$("#newUserForm").submit(function(e) {
    e.preventDefault();

    // Store department ID of the new user
    let newUserDepartmentID = $("#add_user_department").val();

    // Use find() method to find the department object corresponding to the selected department ID
    let newUserLocation = currentDepartments.find(dept => dept.id === newUserDepartmentID).location;
});
