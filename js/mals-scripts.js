'use strict';

class MalsScripts{
    constructor(){
        this.version = 1.1;
        this.aitsafeAdd = 'aitsafe.com/cf/add';    // aitsafe/mals-e address
        this.aitsafeAddSingle = 'aitsafe.com/cf/add.cfm';
        this.aitsafeAddMulti = 'aitsafe.com/cf/addmulti.cfm';
        this.aitsafeReview = 'aitsafe.com/cf/review.cfm';
        this.buyText = 'Buy';                    // default add to cart text
        this.boughtText = 'Added to Cart';      // default added to cart text
        this.cartDelimiter = '{br}';
        this.scripts = [
            {
                id: 'countcharacters',
                name: 'Count Characters',
                category: 'Misc',
                title: 'Display Amount of Text Remaining',
                description: 'Show number of characters allowed to the customer.',
                added: '2018-04-26'
            },
            {
                id: 'generateoptions',
                name: 'Generate Options',
                category: 'Dynamic Price',
                title: 'Auto Create Price Options',
                description: 'Populate price options depending on what has been selected.',
                added: '2018-04-21'
            },
            {
                id: 'discounttotal',
                name: 'Discount Total',
                category: 'Dynamic Price',
                title: 'Display the discount options',
                description: 'Shows the current price based on discount.',
                added: '2018-04-20'
            },
            {
                id: 'imageoptions',
                name: 'Image Options',
                category: 'Dynamic Price',
                title: 'Change/View Pictures',
                description: 'Change the product picture(s) depending on item(s) selected.',
                added: '2018-04-15'
            },
            {
                id: 'form2link',
                name: 'Form2Link',
                category: 'Misc',
                title: 'Add to Cart Form to Link',
                description: 'Change the buy now button form into a link.',
                added: '2018-04-09'
            },
            {
                id: 'silentcart',
                name: 'Silent Cart',
                category: 'Cart Additions',
                title: 'Make a silent call to Mals Cart',
                description: 'Add to cart without going there. Can be used to e.g. show on-screen message.',
                added: '2018-04-10'
            },
            {
                id: 'restrictqty',
                name: 'Restrict Quantities',
                category: 'Validate',
                title: 'Restrict Quantity Per Option',
                description: 'Set quantities based on options e.g. Medium must have a quantity between x3-6.',
                added: '2018-04-11'
            },
            {
                id: 'runningtotal',
                name: 'Running Total',
                category: 'Dynamic Price',
                title: 'Create a Multi Running Total',
                description: 'Dynamically create a running order total for multiple products.',
                added: '2018-04-12'
            },
            {
                id: 'priceoptions',
                name: 'Price Options',
                category: 'Dynamic Price',
                title: 'Generate Own Price',
                description: 'Dynamically create price additions to an order total.',
                added: '2018-04-13'
            },
            {
                id: 'minorder',
                name: 'Minimum Order',
                category: 'Validate',
                title: 'Order has Minimum Value',
                description: 'Customer cannot add to cart unless total is over certain value.',
                added: '2018-04-14'
            }
        ]
        
    }

    // Methods
    // --------------------------------------------
    static form2link(element,callback,callbackClick){
        /*
        Converts add to cart form(s) to hyperlink
        
        Notes:
        - does not work with <select> (due to nature of dropdown)
        - does not take into account HTML5 form attribs. like formaction, formmethod etc.
        - if qty not added (esp. multiform) default to 1     
        - use class 'mals-ignore' in form to exclude it

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = callback > function > called after element created
        3rd = callbackClick > function > called when created link is clicked
        */
        
        if (element === undefined || element === '' || element === null) element = 'form';
        let elements = $(element);

        // Loop all elements
        elements.each(function(){
            let form = this;
            let formAction = MalsScripts.isMalsAdd($(form),'aitsafeAdd');
            let formSubmit = $('input[type="submit"], button[type="submit"]',form);

            // Check if correct form action
            if (formAction === '') return;

            // Create link
            let url = MalsScripts.getFormUrl(form,formAction,false);
            let formSubmitText = this.buyText;
            if (formSubmit.text() !== '') formSubmitText = formSubmit.text();
            if (formSubmit.val() !== '') formSubmitText = formSubmit.val();

            let link = document.createElement('a');
            link.appendChild(document.createTextNode(formSubmitText));
            link.title = formSubmitText;
            link.href = url;

            // Add link & remove form
            $(form).after(link).remove();

            // Add special class for link
            $(link).addClass('mals-link');

            // Callback if applicable
            if (callback !== undefined && callback !== null) callback();
            
            // After link click
            if (callbackClick !== undefined && callbackClick !== null) $(link).on('click',function(e){callbackClick(e);})
        });
    }

    // --------------------------------------------
    static silentCart(element,callback,callbackClick){
        /*
        Create silent call to cart via iframe and update user
        
        Notes:
        - uses Bootstrap .modal box by default. Can use own function to override    
        - use class 'mals-ignore' in form/link to exclude it

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = callback > function > called after element created
        3rd = callbackClick > function > called when created link is clicked
        */
        
        if (element === undefined || element === '' || element === null) element = 'form,a';
        let elements = $(element);

        // Loop all elements
        elements.each(function(){
            // Validate
            if (MalsScripts.isMalsAdd($(this),'aitsafeAdd') === '') return;

            // Create temp iframe
            $('#malsiframe').remove();
            let iframe = document.createElement('iframe');
            iframe.setAttribute('name','malsiframe');
            $(iframe).css('display','none');
            $("body").append(iframe);

            // Set iframe target for form & link
            $(this).attr('target','malsiframe');
            $(this).on('submit',function(e){MalsScripts.callbackFunctionSilentCart(callbackClick,e);})
            if ($(this).is('a')) $(this).on('click',function(e){MalsScripts.callbackFunctionSilentCart(callbackClick,e);})

            // Callback if applicable
            if (callback !== undefined && callback !== null) callback();
            
        })
    }

    static callbackFunctionSilentCart(callbackClick,e){
        // Silent cart added to cart via iframe
        // Tries bootstrap .modal() function or else alert
        
        if (callbackClick === undefined || callbackClick === null){
            try {
                $(".mals-modal-addcart").modal();
            }
            catch(err){
                alert(new this()['boughtText']);
            }
        }else{
            callbackClick(e);
        }
    }

    // --------------------------------------------
    static restrictQty(element,callbackError,callback){
        /*
        Restricts quantity based on option selected
        
        Notes:
        - only works on single productpr/qty, not multi   
        - use class 'mals-ignore' in form/link to exclude it

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = callbackError > function > called if error occurred
        - Overrides default Bootstrap
        - returns err,obj,e,option
        -- err = error code e.g. MinMax
        -- obj = object where error lies
        -- e = event
        -- option = object (properties below)
        --- option.item
        --- option.index
        --- option.min
        --- option.max
        --- options.productpr
        3rd = callback > function > called after form submitted and everything okay
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);
        let error = {};

        // Loop all elements
        elements.submit(function(e){
            // Get form elements
            let form = this;
            let qty = $('input[name=qty]',form).val();
            if (qty === undefined) qty = $('select[name=qty]',form).val();
            qty = parseInt(qty);
            if (isNaN(qty)) return MalsScripts.raiseErrorRestrictQty('QtyNaN',$('input[name=qty]',form),callbackError,e);

            // Get productpr options (**not required but useful)
            let prOptions = [];
            $(':input[name=productpr] > option',form).each(function() {
                // productpr = Product:Price:Units:Scode:Hash
                let option = {
                    name: this.text,
                    product: (this.value).split(':')[0],
                    price: (this.value).split(':')[1],
                    units: (this.value).split(':')[2],
                    scode: (this.value).split(':')[3],
                    hash: (this.value).split(':')[4],
                    selected: false
                }
                prOptions.push(option);
            });

            if (prOptions.length === 0) return MalsScripts.raiseErrorRestrictQty('NoPrOptions',$(':input[name=productpr]',form),callbackError,e);

            // Set selected option
            prOptions[$(':input[name=productpr] option:selected',form).index()].selected = true;

            // Get qty options
            // eg mals-qty="1..5,6..10,11+"
            let qtyOptions = $(':input[name=productpr]',form).attr('mals-qty').split(',');

            if (qtyOptions.length !== prOptions.length) return MalsScripts.raiseErrorRestrictQty('NoMatchPrOptions',$(':input[name=productpr]',form),callbackError,e);

            // Loop qty options and check against qty
            for (let item in qtyOptions){   

                var min = qtyOptions[item].split('..')[0];
                var max = (qtyOptions[item].split('..')[1] !== undefined) ? qtyOptions[item].split('..')[1] : min;

                if (min.search('\\+') > -1){
                    max = Infinity;
                    min = min.replace('+','');
                }

                let option = {
                    item: qtyOptions[item],
                    index: item,
                    min: min,
                    max: max,
                    productpr:prOptions[item]
                };

                // Compare qty and selected productpr option
                //console.log(prOptions[item].selected + ', qty:' + qty + ', option = min:' + option.min + ' max:' + option.max);
                if (prOptions[item].selected){
                    if(qty >= option.min && qty <= option.max){break;}else{return MalsScripts.raiseErrorRestrictQty('MinMax',$(':input[name=productpr]',form),callbackError,e,option);}
                }
            }
            
            // Callback if applicable
            if (callback !== undefined && callback !== null) callback();
            
            return true;
        })
    }

    static raiseErrorRestrictQty(err,obj,callbackError,e,option){
        // Error raise
        if (callbackError !== undefined && callbackError !== null){
            callbackError(err,obj,e,option);
        }else{
            // Default error handling via Bootstrap
            $('.mals-alert').remove();
            $(obj).after(`<div class="alert alert-${MalsScripts.errorsRestrictQty(err,option).type} alert-dismissible mals-alert"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>${MalsScripts.errorsRestrictQty(err,option).value}</div>`);
        }
        return false;
    }

    static errorsRestrictQty(err,option){
        // List of errors and return values
        let errors = [];
        errors.push({name:'QtyNaN', value:`Please enter a correct quantity`, type:'warning'});
        errors.push({name:'NoPrOptions', value:`No product options`, type:'danger'});
        errors.push({name:'NoMatchPrOptions', value:`Mismatch product options`, type:'danger'});
        if (option !== undefined){
            let errorMessage = `Quantity must be between ${option.min} and ${option.max}`;
            if (option.max === Infinity) errorMessage = `Quantity must be ${option.min}+`;
            if (option.max === option.min) errorMessage = `Quantity must be ${option.min}`;
            errorMessage += ` for ${option.productpr.name}`;
            errors.push({name:'MinMax', value: errorMessage, type:'warning'});
        }

        for (let error in errors){
            if (errors[error].name === err){
                  return errors[error];
            }
        }
    }

    // --------------------------------------------
    static runningTotal(element,cartDelimiter,callback,callbackClick){
        /*
        Dynamically updates running total
        
        Notes:
        - use class 'mals-ignore' in form/link to exclude it
        - override default creation/placement of total by adding div or span with id = malsRunningTotal

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = cartDelimiter > string > when added to cart for display e.g. , (default = {br})
        3rd = callback > function > called after total field is updated
        4th = callbackClick > function > called when option is changed
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);
        
        $(':input[name^="qty"],:input[name^="product"]',elements).on('change input',function(e){
            MalsScripts.runningTotalDisplay(elements,cartDelimiter,callback);

            // Callback if applicable
            if (callbackClick !== undefined && callbackClick !== null) callbackClick(e);

        })
        
        MalsScripts.runningTotalDisplay(elements,cartDelimiter,callback);
    }

    static runningTotalDisplay(form,cartDelimiter,callback){                
        // Display running total
        let totalText = MalsScripts.runningTotalCalc(form,cartDelimiter);
        if ($('#malsRunningTotal',form).length === 0) $(form).append('<div id="malsRunningTotal" class="mals-running-total"></div>');
        $('#malsRunningTotal',form).text(totalText);
        
        // Callback if applicable
        if (callback !== undefined && callback !== null) callback();
    }

    static runningTotalCalc(form,cartDelimiter){
        // Update running total
        let total = 0;
        if (cartDelimiter === undefined) cartDelimiter = new this()['cartDelimiter'];

        // Calculates totals
        // addmulti.cfm & add.cfm
        if (MalsScripts.isMalsAdd(form,'aitsafeAddMulti') !== ''){
            $(':input[name^="qty"]',form).each(function(){
                let qty = $(this).val();
                let qtyName = $(this).attr('name').replace('qty','');
                let price = $(':input[name="price' + qtyName +'"]',form).val();

                if (isNaN(qty) || isNaN(price)) return;
                
                // Ignore if mals-ignore class is present
                if (!$(':input[name="price' + qtyName +'"]').hasClass('mals-ignore')){ 
                    total += (qty*price);
                }
            })
        }else{
            // Product options script
            let product = '';
            let qty = $(':input[name="qty"]',form).val();
            let price = $(':input[name="price"]',form).val();

            if (isNaN(qty)) qty = 1;
            if (isNaN(price)) price = 0;
            total += parseFloat(price);

            $(':input[name^="product"]',form).each(function(){
                let item = $(this).val();
                let itemName = item.split(':')[0];
                let itemPrice = item.split(':')[1];
                let inputType = $(this).attr('type');
                
                // Defaults
                if (itemPrice === undefined) itemPrice = 0;
                if (isNaN(itemPrice)) itemPrice = 0;
                if (inputType === undefined) inputType = '';
             
                // Validate todo ensure all scripts use this to check for mals-ignore
                let addToList = true;
                if ($(this).hasClass('mals-ignore')) addToList = false;
                if ((inputType.toLowerCase() === 'checkbox' || inputType.toLowerCase() === 'radio') && !$(this).prop('checked')) addToList = false;

                // Add item to list
                if (addToList){ 
                    product += itemName + cartDelimiter;
                    total += parseFloat(itemPrice);
                }
            })

            // Add product to hidden field malsProduct
            if (product !== '') product = product.substr(0,product.length-cartDelimiter.length);
            $('#malsProduct',form).remove();
            $(form).append('<input type="hidden" id="malsProduct" />');
            $('#malsProduct',form).val(product);

             // Add price to hidden field malsPrice
            $('#malsPrice',form).remove();
            $(form).append('<input type="hidden" id="malsPrice" />');
            $('#malsPrice',form).val(total.toFixed(2));

            total = total*qty;
        }

        // Display running total
        total = (total).toFixed(2);

        return total;
    }

    // --------------------------------------------
    static minOrderTotal(element,min,callbackError,callback){
        /*
        Checks minimum order total when form submitted
        
        Notes:
        - uses runningTotalCalc method
        - only works with forms

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = min > number > minimum value to order
        3rd = callbackError > function > called to override default error function
        - Returns min,total,form,e
        -- min = minimum value
        -- total = current total
        -- form = form selected
        -- e = event
        4th = callback > function > called after form submitted and no errors
        - Returns e
        -- e = event
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);

        elements.submit(function(e){         
            let total = MalsScripts.runningTotalCalc($(this));
            if (total < min){
                if (callbackError !== undefined && callbackError !== null){
                    callbackError(min,total,element,e);
                }else{
                    // Default error handling via Bootstrap
                    $('.mals-alert',this).remove();
                    $(this).prepend(`<div class="alert alert-warning alert-dismissible mals-alert">
                    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                    Order total must be ${(min).toFixed(2)} (Currently ${total})
                    </div>`);
                }
                return false;
            }
            
            // Call callback on submit if applicable
            if (callback !== undefined && callback !== null) callback(e);
            
            return true;
        })
    }

    // --------------------------------------------
    static priceOptions(element,cartDelimiter,callback,callbackRunning,callbackClickRunning){
        /*
        Dymamically updates running total and adds price additions from productpr
        
        Notes:
        - uses runningTotal method
        - override default creation/placement of total by adding div or span with id = malsRunningTotal
        - only works with forms
        - utilises runningTotal()

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = cartDelimiter > string > when added to cart for display e.g. , (default = {br})
        3rd = callback > function > called after form submitted
        4th = callbackRunning > function > called after total field updated
        4th = callbackClickRunning > function > called when input element is clicked
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);
        
        MalsScripts.runningTotal(element,cartDelimiter,callback,callbackRunning,callbackClickRunning);

        elements.submit(function(e){
            $(':input[name^="product"]',this).attr('name','oldproduct');
            $('#malsProduct',this).attr('name','product');

            $(':input[name^="price"]',this).attr('price','oldprice');
            $('#malsPrice',this).attr('name','price');

            // Call callback on submit if applicable
            if (callback !== undefined && callback !== null) callback(e);
        })
    }
    
    // --------------------------------------------
    static imageOptions(element,callback,callbackClick){
        /*
        Dynamically change product image(s)
        
        Notes:
        - use class 'mals-ignore' in form/link to exclude it
        - override default creation/placement of total by adding div or span with id = malsRunningTotal

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = callback > function > called after total field is updated
        3rd = callbackClick > function > called when option is changed
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);
        
        // addmulti.cfm & add.cfm
        if (MalsScripts.isMalsAdd(elements,'aitsafeAddMulti') !== ''){
            $('input[name^="qty"], select[name^="qty"]',elements).on('change input',function(e){
                MalsScripts.imageOptionsDisplay(elements, callback);
                
                // Callback if applicable
                if (callbackClick !== undefined && callbackClick !== null) callbackClick(e);
            })
        }else{
            $('input[name="qty"], select[name="qty"], select[name^="product"]',elements).on('change input',function(e){
                MalsScripts.imageOptionsDisplay(elements, callback);
                
                // Callback if applicable
                if (callbackClick !== undefined && callbackClick !== null) callbackClick(e);
            })
        }
        
        MalsScripts.imageOptionsDisplay(elements,callback);
    }
    
    static imageOptionsDisplay(form,callback){                
        // Display images
        /*
        Note:
        - Main image = #malsImageDisplay & .mals-image-display
        - Will create html markup like below
        <div id="malsImageDisplay">
            <img src="support/tshirt-white.png" class="mals-image" />
            <img src="support/zombie.png" class="mals-image-overlay" />
        </div>
        - Context of image is always within form. Position outside of form via CSS if required
        */
        
        let targetFrames = [];
        targetFrames[0] = {
            id: '#malsImageDisplay',
            images:[]
        }
        
        $('input[name^="product"], select[name^="product"]',form).each(function(e){
            // Stack images
            
            // Get image url in JSON format from attribute mals-img
            let imageOptions = $(this).find('option:selected').attr('mals-img');
            if (imageOptions === undefined || imageOptions === '') return;
            imageOptions = imageOptions.toString()
            imageOptions = imageOptions.replace(/\'/g,'\"');   // ensures JSON is correct format

            try{
                imageOptions = JSON.parse(imageOptions);
            }
            catch(err){
                console.log('imageOptionsDisplay() error: ' + err)
                return;
            }

            // Array of .src (if applicable)
            imageOptions.srcs = [];
            if (imageOptions.src !== undefined && imageOptions.src !== '') imageOptions.srcs = imageOptions.src.split(',');
            
            // Image styles
            let imageStyle = '';
            if (imageOptions.left !== undefined && imageOptions.left !== '') imageStyle += 'left:' + imageOptions.left + ";";
            if (imageOptions.top !== undefined && imageOptions.top !== '') imageStyle += 'top:' + imageOptions.top + ";";
            if (imageOptions.scale !== undefined && imageOptions.scale !== '') imageStyle += 'height:' + imageOptions.scale + ";";
            if (imageStyle.length > 0) imageStyle = imageStyle.substr(0,imageStyle.length-1);

            // Add to correct target array
            if (imageOptions.target === undefined) imageOptions.target = targetFrames[0].id;
            imageOptions.target = imageOptions.target.split(',');
    
            //Loop current option.target(s) against targetFrames to see if they exist - push new image or create and push new image
            imageOptions.target.forEach(function(iOption,ioIndex){
                // Create image and set options
                let tempImage = new Image();
                tempImage.className = 'mals-image';

                // Is image an overlay? i.e. z-order stack on layers
                if (imageOptions.overlay !== undefined && imageOptions.overlay !== '') {
                    (!imageOptions.overlay) ? tempImage.className = 'mals-image' : tempImage.className = 'mals-image-overlay';
                }
                
                if (imageOptions.srcs.length > (ioIndex)) tempImage.src = imageOptions.srcs[ioIndex];
                if (imageStyle !== '') tempImage.style = imageStyle;
             
                // Does target frame already exist?
                iOption = iOption.trim();
                let targetFrame = MalsScripts.imageOptionsFrameExists(targetFrames,iOption);
                if (targetFrame === -1){
                    // Target frame does not exist - create
                    targetFrames.push({
                        id: iOption,
                        images:[]
                    })
                    targetFrame = targetFrames.length-1;
                }
                targetFrames[targetFrame].images.push(tempImage);
            })
        })

        // Render images
        for (let frame in targetFrames){
            let targetFrame = targetFrames[frame];

            if ($(targetFrame.id,form).length === 0){
                $(form).prepend(`<div id="${targetFrame.id.replace('#','')}" class="mals-image-display"></div>`);
            }
            
            // Blank canvas
            $(targetFrame.id,form).html('');
            
            // Loop and add all images. NB: use .clone() to create multiple copies or else it will move image!
            for (let img in targetFrame.images){
                $(targetFrame.images[img]).clone().appendTo(targetFrame.id,form);
            }
        }
        
        // Callback if applicable
        if (callback !== undefined && callback !== null) callback(e);
    }
    
    static imageOptionsFrameExists(frames,item){
        // Loops frames array to see if item exists
        for (let frame in frames){
            if (frames[frame].id === item) return frame;
        }
        return -1;
    }

    // --------------------------------------------
    static discountTotal(element,callback,callbackClick){
        /*
        Dynamically updates discount total
        
        Notes:
        - use class 'mals-ignore' in form/link to exclude it
        - override default creation/placement of total by adding div or span with id = malsDiscountTotal

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = callback > function > called after total field is updated
        3rd = callbackClick > function > called when option is changed
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);
        

        $('input[name="qty"], select[name="qty"]',elements).on('change input',function(e){
            MalsScripts.discountTotalDisplay(elements,callback);

            // Callback if applicable
            if (callbackClick !== undefined && callbackClick !== null) callbackClick(e);
        })
        
        MalsScripts.discountTotalDisplay(elements,callback);
    }

    static discountTotalDisplay(form,callback){                
        // Display discount total
        let totalText = MalsScripts.discountTotalCalc(form);
        if ($('#malsDiscountTotal',form).length === 0) $(form).append('<div id="malsDiscountTotal" class="mals-running-total"></div>');
        $('#malsDiscountTotal',form).text(totalText);
        
        // Callback if applicable
        if (callback !== undefined && callback !== null) callback();
    }

    static discountTotalCalc(form){
        // Update discount total
        if (MalsScripts.isMalsAdd(form,'aitsafeAdd') === '') return;
            
        let total = 0;
        let product = '';
        let qty = $('input[name="qty"], select[name="qty"]',form).val();
        let discountpr = $('input[name="discountpr"]',form).val();
        let price = 0;

        if (discountpr === '') return;
        if (isNaN(qty)) qty = 1;

        // discountpr format
        // 3,9.99:4,8.99:0,6.99
        // i.e. qty,price:qty,price:qty:price
        // --> 1-3 = 9.99
        // --> 3-7(3+4=7) = 8.99
        // --> 7+ = 6.99

        let discountprBands = discountpr.split(':');
        let previousMax = 0;
        
        for (let band in discountprBands){
            let bandQty = parseInt(discountprBands[band].split(',')[0]);
            let bandPrice = parseFloat(discountprBands[band].split(',')[1]);
            let min = 1;
            let max = bandQty;
            
            // Set values
            if (parseInt(band) === (discountprBands.length-1)) max = Infinity;
            if (band > 0){
                min = previousMax + 1;
                max+=previousMax;
            }
            
            // Check qty against min/max and display if there
            if (qty >= min && qty <= max){
                return (bandPrice*qty).toFixed(2);
            }
            
            previousMax = max;
        }
    }
    
    // --------------------------------------------
    static generateOptions(element,priceOptionsScript,callback,callbackClick){
        /*
        Dynamically create options based on selections
        
        Notes:
        - use class 'mals-ignore' to exclude it
        - override default creation/placement of total by adding div or span with id = malsGenerateOptions
        - only works with <select>

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = priceOptionsScript > boolean > invoke priceOptions script?
        3rd = callback > function > called after total field is updated
        4th = callbackClick > function > called when option is changed
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);
        
        // Hide sub elements and add class mals-ignore to any product[] fields so Price Options script won't pick up yet
        $('.mals-sub',elements).hide().addClass('mals-hide').find('select[name^="product"]').addClass('mals-ignore');
        
        // Call Price Options Script if applicable
        if (priceOptionsScript === undefined) priceOptionsScript = false;
        priceOptionsScript = Boolean(priceOptionsScript);
        if (priceOptionsScript) MalsScripts.priceOptions(elements);

        $('select[name^="product"]',elements).on('change',function(e){
            MalsScripts.generateOptionsDisplay(this,elements,priceOptionsScript,callback);

            // Callback if applicable
            if (callbackClick !== undefined && callbackClick !== null) callbackClick(e);
        })
    }
    
    static generateOptionsTree(form){
        // Dynamically create options tree using select/input product[] with class = mals-generate
        // Returns json object array
        // NB: not required but useful function
        let productsArray = [];
        
        // List all product options and highlight ones with mals-generate
        $('select[name^="product"]',form).each(function(){
            let product = {
                id: '#' + $(this).attr('id'),
                idDiv: '#' + $(this).attr('id').replace('Option',''),
                visible: $(this).is(":visible"),
                optionSelected: $(this).prop('selectedIndex'),
                options:[]
            }
            
            // Loops each option
            $('option',this).each(function(index){
                let generateID = $(this).attr('mals-generate');
                if (generateID === undefined) generateID = '';
                
                let option = {
                    index: index,
                    generateID: generateID,
                    value: $(this).val()
                }
                
                product.options.push(option);
            })
            
            productsArray.push(product);
        })
        
        let json = '{"products":[';
        for (let product in productsArray){
            json += `{
            "id":"${productsArray[product].id}",
            "idDiv":"${productsArray[product].idDiv}",
            "visible":"${productsArray[product].visible}",
            "optionSelected":"${productsArray[product].optionSelected}",
            "options":[`;
            
            let jsonOptions = '';
            for (let option in productsArray[product].options){
                jsonOptions += `{
                    "index":"${productsArray[product].options[option].index}",
                    "generateID":"${productsArray[product].options[option].generateID}",
                    "value":"${productsArray[product].options[option].value}"
                },`;
            }
            
            jsonOptions = jsonOptions.substr(0,jsonOptions.length-1);
            json += jsonOptions + ']},'
        }
        
        json = json.substr(0,json.length-1);
        json += ']}';
  
        // Create JSON of created options
        json = JSON.parse(json);
        return json;
    }
    
    static generateOptionsGetTree(id,tree){
        // Return option object from optionsTree by id
        // NB: not required but useful function
        for (let product in optionsTree.products){
            if (id === optionsTree.products[product].idDiv) return optionsTree.products[product];
        }
        return null;
    }

    static generateOptionsDisplay(element,form,priceOptionsScript,callback){  
        // Display options
        //let optionsTree = MalsScripts.generateOptionsTree(form);
        
        // Hide all generated options from this element on (for all mals-generate inc. not selected)
        let hideProducts = [];
        
        // Start with base elements
        $('option',element).each(function(index){
            let malsGenerate = $(this).attr('mals-generate');
            if (malsGenerate !== undefined) hideProducts.push({id:$(this).attr('mals-generate'),done:false});
        })
        
        // Create list of products to hide (start with base elements)
        for (let hideProduct in hideProducts){
            let productDivID = hideProducts[hideProduct].id;
            let productID = '#Option' + productDivID.substr(1,(productDivID.length-1));
            
            // Loop generated/descendant options and add to hideProduct array if applicable
            $(productID + ' option',form).each(function(){
                let malsGenerate = $(this).attr('mals-generate');
                if (malsGenerate !== undefined) hideProducts.push({id:$(this).attr('mals-generate'),done:false});
            })
            
            // Hide select, add class mals-ignore, set selectedIndex to first option
            $(hideProducts[hideProduct].id).hide().find('select[name^="product"]').addClass('mals-ignore').prop('selectedIndex',0);
            hideProducts.splice(hideProduct,1);
        }
            
        // Remaining generated products - hide select, add class mals-ignore, set selectedIndex to first option (NB: as above)
        for (let hideProduct in hideProducts){
            $(hideProducts[hideProduct].id).hide().find('select[name^="product"]').addClass('mals-ignore').prop('selectedIndex',0);
        }
        
        // Show correct product and remove class mals-ignore
        let generateOption = $(element,form).find('option:selected').attr('mals-generate');
        if (generateOption !== undefined){
            $(generateOption).show();
            let generateOptionSeclect = generateOption;
            generateOptionSeclect = '#Option' + generateOptionSeclect.substr(1,generateOptionSeclect.length-1);
            $(generateOptionSeclect).removeClass('mals-ignore');
        }
        if (priceOptionsScript) MalsScripts.priceOptions(form);
        
        // Callback if applicable
        if (callback !== undefined && callback !== null) callback();
    }
    
// --------------------------------------------
    static countCharacters(element,callback){
        /*
        Displays characters used of maxlength of product[] input field

        Arguments:
        1st = element > string > form,.class,#id etc. of elements
        2nd = callback > function > called to override default display function
        - Returns element,charactersRemaining,event
        */
        
        if (element === undefined || element === '' || element === null) element = 'form:first';
        let elements = $(element);

        $(':input[name^="product"]',elements).on('change input',function(e){
            let maxlength = $(this).attr('maxlength');
            if (maxlength === undefined) maxlength = -1;
            let valueLength = $(this).val().length;
            let charactersRemaining = 0;
            
            // Validate
            let exit = false;
            if ($(this).hasClass('mals-ignore')) exit = true;
            if (maxlength < 0) exit = true;
            if (exit) return;
            
            charactersRemaining = maxlength - valueLength;
            
            if (callback !== undefined){
                callback($(this),charactersRemaining,e);
            }else{
                // Default error handling via Bootstrap
                $('.mals-alert',elements).remove();
                $(this).after(`<div class="alert alert-warning alert-dismissible mals-alert">
                <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
                Characters Remaining: ${charactersRemaining}
                </div>`);
            }
        })
    }

    // --------------------------------------------
    // Helper functions
    // --------------------------------------------
    static getFormUrl(form,formAction,encodeurl){
        // Loop all input elements
        let elements = [];
        $(':input',form).each(function(){
            let name = $(this).attr('name');
            let value = $(this).attr('value');

            // Validate
            if (value === undefined) value = $(this).text();
            if (name === undefined) return;
             // Checkboxes/radio buttons
            if ($(this).attr('type') !== undefined){
                if (($(this).attr('type').toLowerCase() === 'checkbox' || $(this).attr('type').toLowerCase() === 'radio') && $(this).attr('checked') === undefined) return;
            }
            // Disabled
            if ($(this).attr('disabled') !== undefined) return;
            // (Multi) quantity - set to 1 if no value
            if (name.toLowerCase().substr(0,3) ==='qty' && value === '') value = 1;

            // Set params
            let params = {
                name: name,
                value: value
            };

            // Add element to url
            elements.push(params);
        });

        if (elements.length === 0) return;
        let url = formAction;
        url += '?' + $.param(elements);
        if (encodeurl) url = encodeURIComponent(url);
        //console.log(url)
        return url;
    }

    static isMalsAdd(obj,mals){
        // Is element set to add to mals cart?
        // Returns blank string if false or action/href of element if true
        let elementAction = obj.attr('action');
        if (elementAction === undefined) elementAction = obj.attr('href');

        let malsAction =  new this()[mals];

        // Check if correct form action and has no .mals-ignore class
        if (elementAction === undefined) return '';
        if (elementAction.toLowerCase().search(malsAction.toLowerCase()) < 0) return '';
        if (obj.hasClass('mals-ignore')) return '';
        return elementAction;
    }
    
    static removeDuplicates(myArr, prop) {
        // Returns array
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }
    
    static validate(form){
        // Validate form by required attribute (non HTML5 browsers)
        $(form).on('submit',function(e){
            $(':input',this).removeClass('alert-warning');

            let ok = true;
            $(':input[required]',this).each(function(e){
                if ($(this).val() === '') $(this).addClass('alert-warning');
                if (ok) $(this).focus();
                ok = false;
            })

            if (!ok) return false;
            $(this).attr('action','form-support.php');
            return true;
        })
    }
}
