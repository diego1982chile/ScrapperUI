/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['knockout',   
        'ojs/ojresponsiveutils', 
        'ojs/ojresponsiveknockoututils',
        'ojs/ojarraydataprovider',     
        "ojs/ojlistdataproviderview",  
        "ojs/ojdataprovider",
        'ojs/ojinputtext',                
        'ojs/ojbufferingdataprovider',        
        'ojs/ojarraytabledatasource',                
        'ojs/ojtable',
        'ojs/ojmenu', 
        'ojs/ojoption'
        ],
 function(ko, responsiveUtils, responsiveKnockoutUtils, ArrayDataProvider, ListDataProviderView, ojdataprovider_1) {
     
    function DashboardViewModel() {

        var self = this;      
       
        self.isSmall = responsiveKnockoutUtils.createMediaQueryObservable(
        responsiveUtils.getFrameworkQuery(responsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY));
        self.isMediumOrUp = responsiveKnockoutUtils.createMediaQueryObservable(
        responsiveUtils.getFrameworkQuery(responsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP));
                           
        self.filter = ko.observable("");                 
        
        self.editRow = ko.observable();
        
        self.data = ko.observableArray();          

        self.datasource = ko.computed(function () {                        
          
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "accounts").
                then(function (accounts) {                                        
                    self.data(accounts);                                        
            });             
            
            let filterCriterion = null;                        

            if (self.filter() && self.filter() != "") {
                filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                    //filterDef: { text: self.filter() },
                    filterDef: {op: '$or', 
                                criteria: [{op: '$co', value: {client: { name : self.filter() }}},
                                           {op: '$co', value: {retailer: { name : self.filter() }}}]
                                },
                    //filterOptions: {textFilterAttributes: ["client"]}
                });
                console.log(filterCriterion);
            }                        
                       
            const arrayDataProvider = new ArrayDataProvider(
                self.data,
                {idAttribute: 'id'}
            ); 
    
            //console.log(self.data());

            return new ListDataProviderView(arrayDataProvider, 
                                            {filterCriterion: filterCriterion},
                                            );
                                                 
        });      
        
        
        self.editedData = ko.observable("");
        
        self.beforeRowEditListener = (event) => {
              self.cancelEdit = false;
              const rowContext = event.detail.rowContext;
              
              self.getById(rowContext.status.rowKey)
              
              self.originalData = Object.assign({}, self.getById(rowContext.status.rowKey));
              self.rowData = Object.assign({}, self.getById(rowContext.status.rowKey));
                            
              
              console.log(self.rowData);
        };
        
        // handle validation of editable components and when edit has been cancelled
        self.beforeRowEditEndListener = (event) => {
            console.log(event);
            self.editedData("");            
            const detail = event.detail; 
            if (!detail.cancelEdit && !self.cancelEdit) {
                if (self.hasValidationErrorInRow(document.getElementById("table"))) {
                    event.preventDefault();
                }
                else {
                    if (self.isRowDataUpdated()) {
                        const key = detail.rowContext.status.rowIndex;
                        self.submitRow(key);
                    }
                }
            }
        };
        
        self.submitRow = (key) => {                                       
                 
            console.log(key);

            $.ajax({                    
              type: "POST",
              url: ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "accounts/save",                                        
              dataType: "json",      
              data: JSON.stringify(self.rowData),			  		 
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                                        
                    var msg = "Record has been succesfuly saved";
                    ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Saved', detail: msg, autoTimeout: 5000}]);
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    self.sleep(100).then(() => {   
                        $("#filter").val(val);
                    });   
              },
              error: function (request, status, error) {                                      
              },                                  
            });
                                                                           
        };
        
        self.isRowDataUpdated = () => {
            const propNames = Object.getOwnPropertyNames(self.rowData);
            for (let i = 0; i < propNames.length; i++) {
                if (self.rowData[propNames[i]] !== self.originalData[propNames[i]]) {
                    return true;
                }
            }
            return false;
        };
        
        // checking for validity of editables inside a row
        // return false if one of them is considered as invalid
        self.hasValidationErrorInRow = (table) => {
            const editables = table.querySelectorAll(".editable");
            for (let i = 0; i < editables.length; i++) {
                const editable = editables.item(i);
                /*
                editable.validate();
                // Table does not currently support editables with async validators
                // so treating editable with 'pending' state as invalid
                if (editable.valid !== "valid") {
                    return true;
                }
                */
            }
            return false;
        };
        
        self.handleUpdate = (event, context) => {
            //console.log(context);
            self.editRow({ rowKey: context.row.id });
        };
        
        self.handleDone = () => {
            self.editRow({ rowKey: null });
        };
        
        self.handleCancel = () => {                                                                 
            
            var txt;
            var r = confirm("Are you sure you want to delete this record?");
            
            if (r == true) {
                self.deleteRow(self.rowData.id);
            } else {              
                self.cancelEdit = true;
                self.editRow({ rowKey: null });    
            }                        
        };
        
        self.handleValueChanged = () => {
            self.filter(document.getElementById("filter").rawValue);
        };
        
        self.getById = (id) => {                      
            
            var toReturn; 
                 
            $(self.data()).each(function(key,value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;
                                                                           
        };
        
        self.deleteRow = (key) => {                                       
                 
            console.log(key);

            $.ajax({                    
              type: "DELETE",
              url: ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "accounts/delete/" + key,                                        
              dataType: "json",                    
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                                        
                    var msg = "Record has been succesfuly deleted";
                    ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Deleted', detail: msg, autoTimeout: 5000}]);
                    var val = $("#filter").val();
                    $("#filter").val(" ");                    
                    self.sleep(100).then(() => {   
                        $("#filter").val(val);
                    });   
              },
              error: function (request, status, error) {                                    
              },                                  
            });                                                                           
        };
        
        self.id = ko.observable();
        
        self.clientArray = ko.observableArray();                   

        self.client = ko.observable();

        self.clients = ko.computed(function () {                        

            $.getJSON(ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "clients").
                then(function (clients) {                                        
                  self.clientArray(clients);                                        
            });                                

            return new ArrayDataProvider(
                self.clientArray,
                {idAttribute: 'id'}
            );        

        });   
        
        self.getItemText = function (itemContext) {
            return itemContext.data.name;
        };
        
        self.retailerArray = ko.observableArray();                           
        
        self.retailers = ko.computed(function () {                        

            $.getJSON(ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "retailers").
                then(function (retailers) {                                        
                  self.retailerArray(retailers);                                        
            });                                

            return new ArrayDataProvider(
                self.retailerArray,
                {idAttribute: 'id'}
            );        

        }); 
        
        self.retailer = ko.observable();
        
        self.user = ko.observable();
        
        self.password = ko.observable();
        
        self.company = ko.observable();
        
        self.createAccount = function (event, data) {           
            
            let element1 = document.getElementById("client");
            let element2 = document.getElementById("retailer");            
            let element3 = document.getElementById("user");
            let element4 = document.getElementById("password");
            
            let valid = false;

            element1.validate().then((result1) => {

                element2.validate().then((result2) => {
                    
                    element3.validate().then((result3) => {
                                        
                        element4.validate().then((result4) => {
                            
                            if (result1 === "valid" && result2 === "valid" &&
                                result3 === "valid" && result4 === "valid") {
                                // submit the form would go here
                                //alert("everything is valid; submit the form");
                                var account = {};
                                
                                console.log(JSON.stringify(data.id()));
                                
                                account.id = self.id();
            
                                account.client = self.getClientById(data.client());
                                account.retailer = self.getRetailerById(data.retailer());
                                account.username = data.user();
                                account.password = data.password();
                                account.company = data.company();

                                //console.log(JSON.stringify(account));                               

                                $.ajax({                    
                                    type: "POST",
                                    url: ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "accounts/save",                                        
                                    dataType: "json",      
                                    data: JSON.stringify(account),			  		 
                                    //crossDomain: true,
                                    contentType : "application/json",                    
                                    success: function() {                                                            
                                        var msg = "Record has been succesfuly saved";
                                        ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Saved', detail: msg, autoTimeout: 5000}]);
                                        $("input").val(""); 
                                        var val = $("#filter").val();
                                        $("#filter").val(val + " ");
                                        self.sleep(1000).then(() => {   
                                            $("#filter").val(val);
                                        });                                        
                                        if(self.isMediumOrUp()) {
                                            document.getElementById('table').refresh();
                                        }                                                                              
                                        self.handleCreate(event, data);
                                        self.sleep(100).then(() => { 
                                            document.getElementById("dialog1").close();   
                                        });                                                                                                                                                  
                                    },
                                    error: function (request, status, error) {                                                                  
                                    },                                  
                                });            
                            }                         
                        });
                    });
                });
            });                                                
        }
        
        self.getRetailerById = (id) => {                      
            
            var toReturn; 
                 
            $(self.retailerArray()).each(function(key, value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;                                                                           
        };
        
        self.getClientById = (id) => {                      
            
            var toReturn; 
                 
            $(self.clientArray()).each(function(key, value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;                                                                           
        };
                
        
        self.handleCreate = function(event, context) {   
            self.id(null);
            self.openDialog(event, context.data);
        }
        
        self.handleEdit = function(event, context) {   
                        
            self.id(context.data.id);
            self.client(context.data.client.id);
            self.retailer(context.data.retailer.id);
            self.user(context.data.username);
            self.password(context.data.password);
            self.company(context.data.company);
            
            document.getElementById("dialog1").open();  
            
            //self.openDialog(event, context.data);                                  
        } 
        
        self.handleDelete = function(event, context) {   
            
            console.log(context);
            
            console.log(event);
                       
            self.editRow({ rowKey: context.data.id });
            self.rowData = context.data;
            self.handleCancel();
                                   
        } 
        
        self.openDialog = function(event, data) {   
            if(!self.id()) {
                self.client(null);
                self.retailer(null);
                self.user(null);
                self.password(null);
                self.company(null);
            }
            document.getElementById("dialog1").open();                 
        } 
        
        self.sleep = (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
    }
    
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return DashboardViewModel;
  }
);
