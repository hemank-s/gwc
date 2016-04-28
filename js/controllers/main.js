materialAdmin

// =========================================================================
// Base controller for common functions
// =========================================================================

    .controller('materialadminCtrl', function($timeout, $state, $scope, growlService) {

    //Welcome Message
    growlService.growl('Welcome back Hiker !', 'inverse');

    // Detact Mobile Browser
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        angular.element('html').addClass('ismobile');
    }

    // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
    this.sidebarToggle = {
        left: false,
        right: false
    };

    // By default template has a boxed layout
    this.layoutType = localStorage.getItem('ma-layout-status');

    // For Mainmenu Active Class
    this.$state = $state;

    this.smsData = {};

    //Close sidebar on click
    this.sidebarStat = function(event) {
        if (!angular.element(event.target).parent().hasClass('active')) {
            this.sidebarToggle.left = false;
        }
    };

    //Listview Search (Check listview pages)
    this.listviewSearchStat = false;

    this.lvSearch = function() {
        this.listviewSearchStat = true;
    };

    //Listview menu toggle in small screens
    this.lvMenuStat = false;

    //Blog
    this.wallCommenting = [];

    this.wallImage = false;
    this.wallVideo = false;
    this.wallLink = false;

    //Skin Switch
    this.currentSkin = 'blue';

    this.skinList = [
        'lightblue',
        'bluegray',
        'cyan',
        'teal',
        'green',
        'orange',
        'blue',
        'purple'
    ];

    this.skinSwitch = function(color) {
        this.currentSkin = color;
    };

})

.directive('ngFiles', ['$parse', function($parse) {

    function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function(event) {
            onChange(scope, { $files: event.target.files });
        });
    }

    return {
        link: fn_link
    };
}])


// .controller('emStatController', function($scope, $http) {
//   console.log("HEllo Hemank");
//})

// .controller('emStatController', ['data',function ($scope, $http, data) {
//     console.log(data);
// }])

.controller('emStatController', ['name',function (name) {
    
    console.log("data received is from em stats fetch is :-");
    console.log(name);
    console.log($scope);

    $scope.userList = name;


}])


.controller('homeController', function($scope, $location, $http, growlService, $state) {

    var formdata = new FormData(); // Form Data For CSV upload
    $scope.filePresent = false;

    $scope.showListSmsInvites = function(route) {
        $location.path(route);
    };

    // Show Em stats here
    $scope.getEmStats = function() {
        console.log($scope.filePresent);
        console.log($scope.msisdn);
        console.log($scope.batchSize);

        if ($scope.filePresent) {
            console.log('CSV file is present');
        } else {
            var userList = $scope.msisdn; // User List of msisdn's comma seperated

            var formDataToSend = {};

            formDataToSend.userList = userList;
            console.log('File is not Present');
            $http({
                    method: 'POST',
                    url: 'http://172.16.1.75/getstatsem',
                    data: $.param(formDataToSend), //forms user object
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                .success(function(data) {
                    $state.go('emresults', { name : data});
                    // if (data.stat == 'ok') {
                    //     $scope.msisdn = '';
                    //     growlService.growl('Data received Successfully !', 'success');
                    // } else {
                    //     $scope.msisdn = '';
                    //     growlService.growl('Some error occured while fetching records, try again later!', 'danger');
                    // }
                });
        }
    };

    // GET THE FILES LIST FROM THE SELECT FILE OPTION

    $scope.getTheFiles = function($files) {
        console.log($files);
        angular.forEach($files, function(value, key) {
            formdata.append('csv', value);
        });

        // Set the File Present as True/False Depending on the Form data has been picked or not
        $scope.filePresent = true;
    };

    // Submit The Refresh File Logs Here
    $scope.submitRefreshLogs = function() {
        console.log('Submiting the refresh logs for the user');

        if ((!$scope.al && !$scope.ll && !$scope.pl && !$scope.cl)) {
            growlService.growl('Please select at least one log !', 'danger');
            return;
        }

        if ($scope.al)
            var al = $scope.al; // application logs
        if ($scope.ll)
            var ll = $scope.ll; // Location Logs
        if ($scope.pl)
            var pl = $scope.pl; // Phone Logs
        if ($scope.cl)
            var cl = $scope.cl; // Call Logs

        if ($scope.filePresent) {

            formdata.append('batchSize', $scope.batchSize);

            if ($scope.al)
                formdata.append('al', true);
            if ($scope.ll)
                formdata.append('ll', true);
            if ($scope.pl)
                formdata.append('pl', true);
            if ($scope.cl)
                formdata.append('cl', true);

            $http({
                    method: 'POST',
                    url: 'http://172.16.1.75/refreshLogs',
                    data: formdata, //forms user object
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                })
                .success(function(data) {
                    console.log(data);
                    if (data.stat == 'ok') {
                        $scope.al = false;
                        $scope.ll = false;
                        $scope.cl = false;
                        $scope.pl = false;
                        $scope.msisdn = '';
                        $scope.filePresent = false;

                        growlService.growl('Successfully sent your packet !', 'success');
                    } else {
                        $scope.al = false;
                        $scope.ll = false;
                        $scope.cl = false;
                        $scope.pl = false;
                        $scope.msisdn = '';

                        growlService.growl('Error sending your packet, try again !', 'danger');
                    }
                });

        } else {
            if (!$scope.msisdn) {
                console.log('Msisdn/Select boxes are empty :: Getting Back');
                growlService.growl('Please fill all the fields !', 'danger');
                return;
            }

            var userList = $scope.msisdn; // User List of msisdn's comma seperated

            var formDataToSend = {};

            formDataToSend.userList = userList;

            if (al)
                formDataToSend.al = true;
            if (ll)
                formDataToSend.ll = true;
            if (cl)
                formDataToSend.cl = true;
            if (pl)
                formDataToSend.pl = true;

            $http({
                    method: 'POST',
                    url: 'http://172.16.1.75/refreshLogs',
                    data: $.param(formDataToSend), //forms user object
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                .success(function(data) {
                    console.log(data);
                    if (data.stat == 'ok') {
                        $scope.al = false;
                        $scope.ll = false;
                        $scope.cl = false;
                        $scope.pl = false;
                        $scope.msisdn = '';

                        growlService.growl('Successfully sent your packet !', 'success');
                    } else {
                        $scope.al = false;
                        $scope.ll = false;
                        $scope.cl = false;
                        $scope.pl = false;
                        $scope.msisdn = '';

                        growlService.growl('Error sending your packet, try again !', 'danger');
                    }
                });

        }

    };

})

.filter('abbreviateRegion', function() {
    return function(input, allRegions) {
        input = allRegions[input];
        return input;

    };
})

.controller('SMSInviteController', function($scope, $http) {

    $scope.editFlags = [];

    $http.get('http://172.16.1.75/getSmsInvite').then(function(response) {

        $scope.msg = response.data.msg;
        $scope.region = response.data.region;
        $scope.dataLoaded = true;

        angular.forEach($scope.msg, function(value, key) {
            $scope.editFlags[key] = false;

        });

        console.log($scope.editFlags);

    }, function() {
        alert('Something went wrong');
    });

    $scope.allRegions = {

        'AP': 'Andhra Pradesh ',
        'AS': 'Assam',
        'BR': 'Bihar and Jharkhand',
        'DL': 'Delhi NCR',
        'GJ': 'Gujarat ',
        'HP': 'Himachal Pradesh',
        'HR': 'Haryana ',
        'JK': 'Jammu and Kashmir ',
        'KL': 'Kerala ',
        'KA': 'Karnataka',
        'KO': 'Kolkata ',
        'MH': 'Maharashtra',
        'MP': 'Madhya Pradesh and Chhattisgarh ',
        'MU': 'Mumbai',
        'NE': 'North East India ',
        'OR': 'Odisha',
        'PB': 'Punjab',
        'RJ': 'Rajasthan',
        'TN': 'Tamil Nadu',
        'UE': 'Uttar Pradesh(East)',
        'UW': 'Uttar Pradesh(West)',
        'WB': 'West',
        'NON_IND': 'Non India',
        'IND': 'India',
        'CH': 'Chennai'

    };

    $scope.linkRegion = function(messageId, regionPrefix) {

        if (angular.isArray($scope.region[regionPrefix]))
            $scope.region[regionPrefix].push(messageId);
        else {
            $scope.region[regionPrefix] = [messageId];
        }

    };

    $scope.unlinkRegion = function(messageId, regionPrefix) {

        var index = $scope.region[regionPrefix].indexOf(messageId);
        $scope.region[regionPrefix].splice(index, 1);
    };

    $scope.addMessage = function() {

        var messageId = $scope.findMax(Object.keys($scope.msg)) + 1;
        $scope.msg[messageId] = '';
        $scope.editFlags[messageId] = true;

    };

    $scope.findMax = function(arr) {

        var max = 0;
        for (var i = 0; i < arr.length; i++)
            if (parseInt(arr[i]) > max)
                max = parseInt(arr[i]);

        return max;
    };

    $scope.delete = function(messageId) {
        var index;
        delete $scope.msg[messageId];
        angular.forEach($scope.region, function(value, key) {

            index = value.indexOf(messageId);
            if (index != -1)
                value.splice(index, 1);
        });
    };

    $scope.changeMessage = function(messageId, message) {

        $scope.editFlags[messageId] = false;
        $scope.msg[messageId] = message;

    };

    $scope.submit = function(messageId) {
        var dataToSend = {};

        dataToSend.msg = $scope.msg;
        dataToSend.region = $scope.region;

        dataToSend = { 'message': dataToSend };

        console.log(dataToSend);

        $http.post('http://172.16.1.75/postSmsInvite', dataToSend).then(function(response) {

            console.log(response);

        }, function() {
            alert('Something went wrong');
        });

    };

})

// =========================================================================
// Header
// =========================================================================
.controller('headerCtrl', function($timeout, messageService) {

    // Top Search
    this.openSearch = function() {
        angular.element('#header').addClass('search-toggled');
        angular.element('#top-search-wrap').find('input').focus();
    }

    this.closeSearch = function() {
        angular.element('#header').removeClass('search-toggled');
    }

    // Get messages and notification for header
    this.img = messageService.img;
    this.user = messageService.user;
    this.user = messageService.text;

    this.messageResult = messageService.getMessage(this.img, this.user, this.text);

    //Clear Notification
    this.clearNotification = function($event) {
        $event.preventDefault();

        var x = angular.element($event.target).closest('.listview');
        var y = x.find('.lv-item');
        var z = y.size();

        angular.element($event.target).parent().fadeOut();

        x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
        x.find('.grid-loading').fadeIn(1500);
        var w = 0;

        y.each(function() {
            var z = $(this);
            $timeout(function() {
                z.addClass('animated fadeOutRightBig').delay(1000).queue(function() {
                    z.remove();
                });
            }, w += 150);
        })

        $timeout(function() {
            angular.element('#notifications').addClass('empty');
        }, (z * 150) + 200);
    }

    this.submitForm = function() {
        console.log('Submitting form');
    }

    // Open the Web Client From Within The Growth Console

    this.openWebClient = function() {
        swal({
            title: 'Are you sure?',
            text: 'You will navigate to another window',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Yes,Hike Web !',
            closeOnConfirm: false
        }, function() {
            window.open('http://54.254.187.77:9090/');

            //swal("Done!", "localStorage is cleared", "success");
        });
    }

    // Log out From Console

    this.logOutFromConsole = function() {
        swal({
            title: 'Are you sure?',
            text: 'You will be logged out of the growth console !',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Yes, logout!',
            closeOnConfirm: false
        }, function() {
            console.log('Log out :: Show Sign in Screen Again here');
        });
    }

    // Clear Local Storage
    this.clearLocalStorage = function() {

        //Get confirmation, if confirmed clear the localStorage
        swal({
            title: 'Are you sure?',
            text: 'All your saved localStorage values will be removed',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F44336',
            confirmButtonText: 'Yes, delete it!',
            closeOnConfirm: false
        }, function() {
            localStorage.clear();
            swal('Done!', 'localStorage is cleared', 'success');
        });

    }

    //Fullscreen View
    this.fullScreen = function() {

        //Launch
        function launchIntoFullscreen(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }

        //Exit
        function exitFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }

        if (exitFullscreen()) {
            launchIntoFullscreen(document.documentElement);
        } else {
            launchIntoFullscreen(document.documentElement);
        }
    }

})

// =========================================================================
// Best Selling Widget
// =========================================================================

.controller('bestsellingCtrl', function(bestsellingService) {

    // Get Best Selling widget Data
    this.img = bestsellingService.img;
    this.name = bestsellingService.name;
    this.range = bestsellingService.range;

    this.bsResult = bestsellingService.getBestselling(this.img, this.name, this.range);
})

// =========================================================================
// Todo List Widget
// =========================================================================

.controller('todoCtrl', function(todoService) {

    //Get Todo List Widget Data
    this.todo = todoService.todo;

    this.tdResult = todoService.getTodo(this.todo);

    //Add new Item (closed by default)
    this.addTodoStat = false;
})

// =========================================================================
// Recent Items Widget
// =========================================================================

.controller('recentitemCtrl', function(recentitemService) {

    //Get Recent Items Widget Data
    this.id = recentitemService.id;
    this.name = recentitemService.name;
    this.parseInt = recentitemService.price;

    this.riResult = recentitemService.getRecentitem(this.id, this.name, this.price);
})

// =========================================================================
// Recent Posts Widget
// =========================================================================

.controller('recentpostCtrl', function(recentpostService) {

    //Get Recent Posts Widget Items
    this.img = recentpostService.img;
    this.user = recentpostService.user;
    this.text = recentpostService.text;

    this.rpResult = recentpostService.getRecentpost(this.img, this.user, this.text);
})

//=================================================
// Profile
//=================================================

.controller('profileCtrl', function(growlService) {

    //Get Profile Information from profileService Service

    //User
    this.profileSummary = 'Sed eu est vulputate, fringilla ligula ac, maximus arcu. Donec sed felis vel magna mattis ornare ut non turpis. Sed id arcu elit. Sed nec sagittis tortor. Mauris ante urna, ornare sit amet mollis eu, aliquet ac ligula. Nullam dolor metus, suscipit ac imperdiet nec, consectetur sed ex. Sed cursus porttitor leo.';

    this.fullName = 'Hemank Sabharwal';
    this.gender = 'male';
    this.birthDay = '19/02/1993';
    this.martialStatus = 'Single';
    this.mobileNumber = '09599556442';
    this.emailAddress = 'hemank@hike.in';
    this.twitter = '@hemank-s';
    this.twitterUrl = 'twitter.com/hemank-s';
    this.skype = 'hemank.sabharwal';
    this.addressSuite = '22, Baker Street';
    this.addressCity = 'Vasant Kunj, Delhi';
    this.addressCountry = 'India';

    //Edit
    this.editSummary = 0;
    this.editInfo = 0;
    this.editContact = 0;

    this.submit = function(item, message) {
        if (item === 'profileSummary') {
            this.editSummary = 0;
        }

        if (item === 'profileInfo') {
            this.editInfo = 0;
        }

        if (item === 'profileContact') {
            this.editContact = 0;
        }

        growlService.growl(message + ' has updated Successfully!', 'inverse');
    }

})

//=================================================
// LOGIN
//=================================================

.controller('loginCtrl', function() {

    //Status

    this.login = 1;
    this.register = 0;
    this.forgot = 0;
})

//=================================================
// CALENDAR
//=================================================

.controller('calendarCtrl', function($modal) {

    //Create and add Action button with dropdown in Calendar header.
    this.month = 'month';

    this.actionMenu = '<ul class="actions actions-alt" id="fc-actions">' +
        '<li class="dropdown" dropdown>' +
        '<a href="" dropdown-toggle><i class="zmdi zmdi-more-vert"></i></a>' +
        '<ul class="dropdown-menu dropdown-menu-right">' +
        '<li class="active">' +
        '<a data-calendar-view="month" href="">Month View</a>' +
        '</li>' +
        '<li>' +
        '<a data-calendar-view="basicWeek" href="">Week View</a>' +
        '</li>' +
        '<li>' +
        '<a data-calendar-view="agendaWeek" href="">Agenda Week View</a>' +
        '</li>' +
        '<li>' +
        '<a data-calendar-view="basicDay" href="">Day View</a>' +
        '</li>' +
        '<li>' +
        '<a data-calendar-view="agendaDay" href="">Agenda Day View</a>' +
        '</li>' +
        '</ul>' +
        '</div>' +
        '</li>';

    //Open new event modal on selecting a day
    this.onSelect = function(argStart, argEnd) {
        var modalInstance = $modal.open({
            templateUrl: 'addEvent.html',
            controller: 'addeventCtrl',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                calendarData: function() {
                    var x = [argStart, argEnd];
                    return x;
                }
            }
        });
    }
})

//Add event Controller (Modal Instance)
.controller('addeventCtrl', function($scope, $modalInstance, calendarData) {

    //Calendar Event Data
    $scope.calendarData = {
        eventStartDate: calendarData[0],
        eventEndDate: calendarData[1]
    };

    //Tags
    $scope.tags = [
        'bgm-teal',
        'bgm-red',
        'bgm-pink',
        'bgm-blue',
        'bgm-lime',
        'bgm-green',
        'bgm-cyan',
        'bgm-orange',
        'bgm-purple',
        'bgm-gray',
        'bgm-black'
    ]

    //Select Tag
    $scope.currentTag = '';

    $scope.onTagClick = function(tag, $index) {
        $scope.activeState = $index;
        $scope.activeTagColor = tag;
    }

    //Add new event
    $scope.addEvent = function() {
        if ($scope.calendarData.eventName) {

            //Render Event
            $('#calendar').fullCalendar('renderEvent', {
                title: $scope.calendarData.eventName,
                start: $scope.calendarData.eventStartDate,
                end: $scope.calendarData.eventEndDate,
                allDay: true,
                className: $scope.activeTagColor

            }, true); //Stick the event

            $scope.activeState = -1;
            $scope.calendarData.eventName = '';
            $modalInstance.close();
        }
    }

    //Dismiss
    $scope.eventDismiss = function() {
        $modalInstance.dismiss();
    }
})

// =========================================================================
// COMMON FORMS
// =========================================================================

.controller('formCtrl', function() {

    //Input Slider
    this.nouisliderValue = 4;
    this.nouisliderFrom = 25;
    this.nouisliderTo = 80;
    this.nouisliderRed = 35;
    this.nouisliderBlue = 90;
    this.nouisliderCyan = 20;
    this.nouisliderAmber = 60;
    this.nouisliderGreen = 75;

    //Color Picker
    this.color = '#03A9F4';
    this.color2 = '#8BC34A';
    this.color3 = '#F44336';
    this.color4 = '#FFC107';
})

// =========================================================================
// PHOTO GALLERY
// =========================================================================

.controller('photoCtrl', function() {

    //Default grid size (2)
    this.photoColumn = 'col-md-2';
    this.photoColumnSize = 2;

    this.photoOptions = [
        { value: 2, column: 6 },
        { value: 3, column: 4 },
        { value: 4, column: 3 },
        { value: 1, column: 12 }
    ]

    //Change grid
    this.photoGrid = function(size) {
        this.photoColumn = 'col-md-' + size;
        this.photoColumnSize = size;
    }

})

// =========================================================================
// ANIMATIONS DEMO
// =========================================================================
.controller('animCtrl', function($timeout) {

    //Animation List
    this.attentionSeekers = [
        { animation: 'bounce', target: 'attentionSeeker' },
        { animation: 'flash', target: 'attentionSeeker' },
        { animation: 'pulse', target: 'attentionSeeker' },
        { animation: 'rubberBand', target: 'attentionSeeker' },
        { animation: 'shake', target: 'attentionSeeker' },
        { animation: 'swing', target: 'attentionSeeker' },
        { animation: 'tada', target: 'attentionSeeker' },
        { animation: 'wobble', target: 'attentionSeeker' }
    ]
    this.flippers = [
        { animation: 'flip', target: 'flippers' },
        { animation: 'flipInX', target: 'flippers' },
        { animation: 'flipInY', target: 'flippers' },
        { animation: 'flipOutX', target: 'flippers' },
        { animation: 'flipOutY', target: 'flippers' }
    ]
    this.lightSpeed = [
        { animation: 'lightSpeedIn', target: 'lightSpeed' },
        { animation: 'lightSpeedOut', target: 'lightSpeed' }
    ]
    this.special = [
        { animation: 'hinge', target: 'special' },
        { animation: 'rollIn', target: 'special' },
        { animation: 'rollOut', target: 'special' }
    ]
    this.bouncingEntrance = [
        { animation: 'bounceIn', target: 'bouncingEntrance' },
        { animation: 'bounceInDown', target: 'bouncingEntrance' },
        { animation: 'bounceInLeft', target: 'bouncingEntrance' },
        { animation: 'bounceInRight', target: 'bouncingEntrance' },
        { animation: 'bounceInUp', target: 'bouncingEntrance' }
    ]
    this.bouncingExits = [
        { animation: 'bounceOut', target: 'bouncingExits' },
        { animation: 'bounceOutDown', target: 'bouncingExits' },
        { animation: 'bounceOutLeft', target: 'bouncingExits' },
        { animation: 'bounceOutRight', target: 'bouncingExits' },
        { animation: 'bounceOutUp', target: 'bouncingExits' }
    ]
    this.rotatingEntrances = [
        { animation: 'rotateIn', target: 'rotatingEntrances' },
        { animation: 'rotateInDownLeft', target: 'rotatingEntrances' },
        { animation: 'rotateInDownRight', target: 'rotatingEntrances' },
        { animation: 'rotateInUpLeft', target: 'rotatingEntrances' },
        { animation: 'rotateInUpRight', target: 'rotatingEntrances' }
    ]
    this.rotatingExits = [
        { animation: 'rotateOut', target: 'rotatingExits' },
        { animation: 'rotateOutDownLeft', target: 'rotatingExits' },
        { animation: 'rotateOutDownRight', target: 'rotatingExits' },
        { animation: 'rotateOutUpLeft', target: 'rotatingExits' },
        { animation: 'rotateOutUpRight', target: 'rotatingExits' }
    ]
    this.fadeingEntrances = [
        { animation: 'fadeIn', target: 'fadeingEntrances' },
        { animation: 'fadeInDown', target: 'fadeingEntrances' },
        { animation: 'fadeInDownBig', target: 'fadeingEntrances' },
        { animation: 'fadeInLeft', target: 'fadeingEntrances' },
        { animation: 'fadeInLeftBig', target: 'fadeingEntrances' },
        { animation: 'fadeInRight', target: 'fadeingEntrances' },
        { animation: 'fadeInRightBig', target: 'fadeingEntrances' },
        { animation: 'fadeInUp', target: 'fadeingEntrances' },
        { animation: 'fadeInBig', target: 'fadeingEntrances' }
    ]
    this.fadeingExits = [
        { animation: 'fadeOut', target: 'fadeingExits' },
        { animation: 'fadeOutDown', target: 'fadeingExits' },
        { animation: 'fadeOutDownBig', target: 'fadeingExits' },
        { animation: 'fadeOutLeft', target: 'fadeingExits' },
        { animation: 'fadeOutLeftBig', target: 'fadeingExits' },
        { animation: 'fadeOutRight', target: 'fadeingExits' },
        { animation: 'fadeOutRightBig', target: 'fadeingExits' },
        { animation: 'fadeOutUp', target: 'fadeingExits' },
        { animation: 'fadeOutUpBig', target: 'fadeingExits' }
    ]
    this.zoomEntrances = [
        { animation: 'zoomIn', target: 'zoomEntrances' },
        { animation: 'zoomInDown', target: 'zoomEntrances' },
        { animation: 'zoomInLeft', target: 'zoomEntrances' },
        { animation: 'zoomInRight', target: 'zoomEntrances' },
        { animation: 'zoomInUp', target: 'zoomEntrances' }
    ]
    this.zoomExits = [
        { animation: 'zoomOut', target: 'zoomExits' },
        { animation: 'zoomOutDown', target: 'zoomExits' },
        { animation: 'zoomOutLeft', target: 'zoomExits' },
        { animation: 'zoomOutRight', target: 'zoomExits' },
        { animation: 'zoomOutUp', target: 'zoomExits' }
    ]

    //Animate
    this.ca = '';

    this.setAnimation = function(animation, target) {
        if (animation === 'hinge') {
            animationDuration = 2100;
        } else {
            animationDuration = 1200;
        }

        angular.element('#' + target).addClass(animation);

        $timeout(function() {
            angular.element('#' + target).removeClass(animation);
        }, animationDuration);
    }

})
