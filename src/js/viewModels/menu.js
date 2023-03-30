/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your incidents ViewModel code goes here
 */
define(["knockout",    
        'ojs/ojresponsiveutils', 
        'ojs/ojresponsiveknockoututils',
        "ojs/ojarraydataprovider", 
        "ojs/ojconveyorbelt"
    ],
 function(ko, responsiveUtils, responsiveKnockoutUtils, ArrayDataProvider) {

    function MenuViewModel() {                        
        
        var self = this;
        // Below are a set of the ViewModel methods invoked by the oj-module component.
        // Please reference the oj-module jsDoc for additional information. 
        
        self.isSmall = responsiveKnockoutUtils.createMediaQueryObservable(
        responsiveUtils.getFrameworkQuery(responsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY));
        self.isMediumOrUp = responsiveKnockoutUtils.createMediaQueryObservable(
        responsiveUtils.getFrameworkQuery(responsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP));
        
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));

        this.dataProvider = rootViewModel.dataProvider;                                                                    
        
        this.selection = rootViewModel.selection;                                                                    
      
    }
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return MenuViewModel;    
 });
