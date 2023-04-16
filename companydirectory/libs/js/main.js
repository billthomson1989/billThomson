// Global Variables
var currentLocations = [];
var currentDepartments = [];

let firstName_toggle = true;
let lastName_toggle = true;
let email_toggle = true;
let jobTitle_toggle = true;
let department_toggle = true;
let location_toggle = true;

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
                updateUserList();
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        }) 
        
    });

    // Confirm Edit User -> PHP Routine
$("#editUserForm").submit(function(e) {
    e.preventDefault();
    e.stopPropagation();

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/updateUser.php",
        data: $(this).serialize(),
        dataType: 'json',
        async: false,
        success: function(results) {
            const userID = $("#editUserConfirm").attr("userID");
            // Update edited user in the table
            $(`#${userID} td:nth-child(2)`).text($('#edit_user_firstName').val());
            $(`#${userID} td:nth-child(3)`).text($('#edit_user_lastName').val());
            $(`#${userID} td:nth-child(4)`).text($('#edit_user_email').val());
            $(`#${userID} td:nth-child(5)`).text($('#edit_user_jobTitle').val());
            $(`#${userID} td:nth-child(6)`).text($('#edit_user_department option:selected').text());
            $(`#${userID} td:nth-child(7)`).text($('#edit_user_location').text());
            $("#userEditModal").modal('hide');
            $('.modal-backdrop').hide(); // Hide the grey overlay.
            // Update the user list with the updated data
            updateUserList();
            toastr.success('Update complete!');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
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
        success: function(results) {
            $('#addUserModal').modal('hide');
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            updateUserList(); // update user list with new user data
            toastr.success('User has been added successfully! Use the search function to locate them!');
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

            $.ajax({
                type: 'POST',
                url: "../companydirectory/libs/php/updateDepartment.php",
                data: {
                    name: $('#editDepName').val(),
                    locationID: $('#editDepLocation').val(),
                    departmentID: this.attributes.depID.value
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    updateDepartmentList();
                    toastr.success('Update Successful!');
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

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/insertDepartment.php",
            data: {
                name: $('#newDepName').val(),
                locationID: $('#newDepLocation').val()
            },
            dataType: 'json',
            async: false,
            success: function(results) {
                updateDepartmentList();
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

    // Edit Location -> PHP Routine
    $("#editLocForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();
        
        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/updateLocation.php",
            data: {
                name: $('#edit_location_name').val(),
                locationID: $('#edit_location_name').attr("locID"),
            },
            dataType: 'json',
            async: false,
            success: function(results) {
                updateLocationsList();
                toastr.success('Update Successful!');
            },
    
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    });

    // Add Location - Modal
    $("#addLocation").click(function(){
        $('.modal-backdrop').show();
        $('#newLocName').val("");
    })

   // Add Location -> PHP Routine
$("#addLocForm").submit(function(e) {

    e.preventDefault();
    e.stopPropagation();

    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/insertLocation.php",
        data: {
            name: $('#newLocName').val(),
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            updateLocationsList();
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
    for(i=0; i < list.length; i++){
        
        search_html_table += `<tr class="tableRow" id="${list[i].id}"><td scope="row" class="tableIcon"><i class="fas fa-user-circle fa-lg"></i></td><td scope="row">${list[i].firstName}</td><td scope="row">${list[i].lastName}</td><td scope="row" class="hider1">${list[i].email}</td><td scope="row" class="hider1">${list[i].jobTitle}</td><td scope="row" class="hider2">${list[i].department}</td><td scope="row" class="hider2">${list[i].location}</td></tr>`;
        
    }

    if (search_html_table === "") {
        toastr.info('No Search Results Found');
    } else {
        $('#sqlTable').find('tbody').html(`${search_html_table}`);
        toastr.success('Located Successfully!');
    }
}

function getLocations() {
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getLocations.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            currentLocations = [];
            let data = results["data"];

            for (let i = 0; i < data.length; i++) {
                currentLocations.push(data[i]);
            }

        },

        error: function(jqXHR, textStatus, errorThrown) {
            toastr.warning('No search results found');
            console.log(errorThrown);
        }
    })
}

function getDepartmentsByUser(){
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getAllDepartments.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            currentDepartments = [];
            let data = results["data"];

            for(let i=0; i < data.length; i++){
                currentDepartments.push(data[i]);
            }

            toastr.success('Departments retrieved successfully!');

        },

        error: function(jqXHR, textStatus, errorThrown) {
            toastr.error('Failed to retrieve departments!');
            console.log(errorThrown);
        }
    })   
}

function generateDepartmentList(){
    // Generate the html table with department list 
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getAllDepartments.php",
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
                dep_html += `<tr id="${depArray[i].id}" class=" departmentEdit depTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#departmentEditModal" title="${depArray[i].department}" location="${depArray[i].locationID}" users="${depArray[i].users}" departmentID="${depArray[i].id}"><td class="tableIcon"><i class="fas fa-building"></i></td><td scope="row" class="department"> ${depArray[i].department} </td><td scope="row" class="department_location"> ${depArray[i].location} </td>`;
            }

            $('#departmentsList').html(dep_html);
            toastr.success('Department List Generated Successfully!');

        },

        error: function(jqXHR, textStatus, errorThrown) {
            toastr.warning('No search results found');
            console.log(errorThrown);
        }
    })     
}

function getAllUsers(){
    
    // Generate all user data for the table        
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getAll.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            // Update Main HTML Table  
            let data = results["data"];              
            let usersArray = [];
            let html_table = ``;
            
            for(let i=0; i < data.length; i++){
                usersArray.push(data[i]);
            }

            for(let i=0; i < usersArray.length; i++){
                html_table += `<tr class="tableRow" id="${usersArray[i].id}"><td scope="row" class="tableIcon"><i class="fas fa-user-circle fa-lg"></i></td><td scope="row">${usersArray[i].firstName}</td><td scope="row">${usersArray[i].lastName}</td><td scope="row" class="hider1">${usersArray[i].email}</td><td scope="row" class="hider1">${usersArray[i].jobTitle}</td><td scope="row" class="hider2">${usersArray[i].department}</td><td scope="row" class="hider2">${usersArray[i].location}</td></tr>`;
            };
            
            $('#mainTable').html(html_table); 

        },
        error: function(jqXHR, textStatus, errorThrown) {
            toastr.warning('No search results found');
            console.log(errorThrown);
        }
    })
}});