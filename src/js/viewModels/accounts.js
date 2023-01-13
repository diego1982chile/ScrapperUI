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
        'ojs/ojarraydataprovider',     
        "ojs/ojlistdataproviderview",  
        "ojs/ojdataprovider",
        'ojs/ojinputtext',                
        'ojs/ojbufferingdataprovider',        
        'ojs/ojarraytabledatasource',                
        'ojs/ojtable'
        ],
 function(ko, ArrayDataProvider, ListDataProviderView, ojdataprovider_1) {
     
    function DashboardViewModel() {

        var self = this;      
        
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
                                           {op: '$co', value: {holding: { name : self.filter() }}}]
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
                    alert("Registro grabado correctamente");
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
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
            var r = confirm("¿Está seguro que desea eliminar el registro?");
            
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
                    alert("Registro borrado correctamente");
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });                                                                           
        };
        
        self.retailerArray = ko.observableArray();                   

        self.retailer = ko.observable();

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
        
        self.getItemText = function (itemContext) {
            return itemContext.data.name;
        };
        
        self.holdingArray = ko.observableArray();                   

        self.holding = ko.observable();
        
        self.holdings = ko.computed(function () {                        

            $.getJSON(ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "holdings").
                then(function (holdings) {                                        
                  self.holdingArray(holdings);                                        
            });                                

            return new ArrayDataProvider(
                self.holdingArray,
                {idAttribute: 'id'}
            );        

        }); 
        
        self.retailer = ko.observable();
        
        self.user = ko.observable();
        
        self.password = ko.observable();
        
        self.company = ko.observable();
        
        self.createAccount = function (event, data) {
            
            let element1 = document.getElementById("retailer");
            let element2 = document.getElementById("holding");            
            let element3 = document.getElementById("user");
            let element4 = document.getElementById("password");
            
            let valid = false;
            // validate them both, and when they are both done
            // validating and valid, submit the form.
            // Calling validate() will update the component's
            // valid property
            element1.validate().then((result1) => {

                element2.validate().then((result2) => {
                    
                    element3.validate().then((result3) => {
                                        
                        element4.validate().then((result4) => {
                            
                            if (result1 === "valid" && result2 === "valid" &&
                                result3 === "valid" && result4 === "valid") {
                                // submit the form would go here
                                //alert("everything is valid; submit the form");
                                var account = {};
            
                                account.retailer = self.getRetailerById(data.retailer());
                                account.holding = self.getHoldingById(data.holding());
                                account.user = data.user();
                                account.password = data.password();
                                account.company = data.company();

                                //console.log(JSON.stringify(account));
                                
                                //alert(JSON.stringify(account));

                                $.ajax({                    
                                    type: "POST",
                                    url: ko.dataFor(document.getElementById('globalBody')).scrapperServiceBaseUrl() + "accounts/save",                                        
                                    dataType: "json",      
                                    data: JSON.stringify(account),			  		 
                                    //crossDomain: true,
                                    contentType : "application/json",                    
                                    success: function() {                    
                                        alert("Registro grabado correctamente");
                                        $("input").val(""); 
                                        var val = $("#filter").val();
                                        $("#filter").val(" ");
                                        $("#filter").val(val);
                                        document.getElementById("dialog1").close();     
                                    },
                                    error: function (request, status, error) {
                                        alert(request.responseText);                          
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
        
        self.getHoldingById = (id) => {                      
            
            var toReturn; 
                 
            $(self.holdingArray()).each(function(key, value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;                                                                           
        };
        
        
        self.openDialog = function(event, data) {                        
            document.getElementById("dialog1").open();                 
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
