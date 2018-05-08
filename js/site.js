const urlGithub = 'https://lhsoftware.github.io';
const urlGithubMalsScripts = urlGithub + '/scripts/mals-scripts.js';
const urlJQuery = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
const urlBootstrap = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js';
const urlBootstrapCSS = 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css';

$(document).ready(function(){
    // Header
    // Navigation
    let navbar = `<nav id="headerNavbar" class="navbar navbar-inverse navbar-fixed-top">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#headerCollapse">
                    <span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="index.html">LH SOFTWARE</a>
            </div>
            <div class="collapse navbar-collapse" id="headerCollapse">
                <ul id="navbar" class="nav navbar-nav">
                    <li><a class="nav-link" href="index.html">Home</a></li>
                    <li><a class="nav-link" href="mals.html">Mals-e.com Scripts</a></li>
                    <li><a class="nav-link" href="custom.html">Custom Coding</a></li>
                    <li><a class="nav-link" href="support.html">Support</a></li>
                </ul>
            </div>
        </div>
    </nav>`;
    
    $('header').html(navbar);
    
    // Set current page to active
    let pageUrl = window.location.pathname;
    pageUrl = pageUrl.split('/')
    $('#headerNavbar #navbar li a[href="' + pageUrl[pageUrl.length-1] + '"]').parent().addClass('active');
    if (pageUrl[pageUrl.length-1] === '') $('#headerNavbar #navbar li')[0].parent().addClass('active');
    
    // Footer
    let footer = `<div style="text-align:center">&copy; LH Software ${new Date().getFullYear()}</div>`;
    let topLink = `<div id="top" class="btn btn-success" data-spy="affix" data-offset-top="205">
        <a href="#" onclick="$('html, body').animate({ scrollTop: 0 }, 'fast');">^ top</a>
    </div>`;
    $('footer').html(footer + topLink);
})

// Site wide functions
function copyToClipboard(element) {
    var $temp = $('<input>');
    $('body').append($temp);
    $temp.val($(element).text()).select();
    document.execCommand('copy');
    $temp.remove();
}

function createCarousel(array,ref,height,header){
    // Create bootstrap carousel based on passed in array
    // array object = xxxx:yyyy
    // ref = id of carousel to be referenced. Default carousel

    if (ref === undefined || ref === '') ref = 'carousel;'
    if (height === undefined || height === '') height = '100%;'

    let tempCarousel = `<div id="${ref}" class="carousel slide" data-ride="carousel">
        <!-- Round circle indicators -->
        <ol class="carousel-indicators">`;

    for (let item in array){
        let active = (item == 0) ? ' class="active"' : '';
        let indicator = `<li data-target="#${ref}" data-slide-to="${item}"${active}></li>`;
        tempCarousel += indicator;
    }

    tempCarousel += `</ol>
        <!-- Wrapper for slides -->
        <div class="carousel-inner">`;

    for (let item in array){
        let active = (item == 0) ? ' active' : '';
        let slide = `<div class="item${active}">
                <div class="text-center" style="background-color:green"><img src="support/empty.png" style="height:${height};" alt="${array[item].name} Script for mals-e.com" /></a></div>
                <div class="carousel-caption" style="cursor:pointer" onclick="document.location.href='mals.html#${array[item].id}';"><h2 style="color:${header.color};">${header.text}</h2><h3>${array[item].name} Script</h3><p>${array[item].description}</p></div>
            </div>`;
        tempCarousel += slide;
    }

    tempCarousel += `</div>
        <!-- Left/right controls -->
        <a class="left carousel-control" href="#${ref}" data-slide="prev">
            <span class="glyphicon glyphicon-chevron-left"></span>
            <span class="sr-only">Previous</span>
        </a>
        <a class="right carousel-control" href="#${ref}" data-slide="next">
            <span class="glyphicon glyphicon-chevron-right"></span>
            <span class="sr-only">Next</span>
        </a>
    </div>`;

    return tempCarousel;
}

function getContent(element,url,dataType,callback){
    // Ajax call to show content
    $(element).html('<img src="res/spinner.gif" />');
    if (dataType === undefined) dataType = 'text';
    dataType = dataType.toLowerCase();

    $.ajax({
        type: 'GET',
        url: url,
        dataType: dataType,
        success: function(data){
            data = data.replace(exampleMalsUsername,malsUsername);
            data = data.replace(exampleMalsServer,malsServer);
            switch (dataType){
                case 'html':
                    $(element).html(data);
                    break;
                default:
                    $(element).text(data);
                    break;
            }

            if (callback !== undefined) callback();
        },
        error: function(xhr,status,error){
            $(element).text(`There's been a problem '${error}'. Please try again. (${url})`);
        }
    });
}

$.urlParam = function(name){
    // Get url params
    // use let xxxx = $.urlParam('xxxx');
    // NB: returns null value if nothing exists
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null){
        return null;
    }else{
        return decodeURI(results[1]) || 0;
    }
}

function objectSort(array, property,asc){
    // Sorts an array of objects by property name
    // asc = ascend (boolean)
    if (asc === undefined) asc = true;
    array.sort(function(a,b){
        if (asc){
            return a[property].localeCompare(b[property]);
        }else{
            return b[property].localeCompare(a[property]);
        }
    })
    return array;
}