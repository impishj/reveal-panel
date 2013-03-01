(function ($) {  
    // jquery ready
    // needs to live within jquery ready function
    //
    // Get user agent string in lowercase search for android's starting index
    //
    var ua = navigator.userAgent.toLowerCase();
    //
    // get the six chrs after android and combine them.
    // get rid of likely characters that will run our number afoul and convert those strings to floats(numbers)
    //
    var vNum = ua.indexOf("android");
    var vNumCalc = ua[vNum+8] + ua[vNum+9] + ua[vNum+10] + ua[vNum+11] + ua[vNum+12] + ua[vNum+13]; 
    var androidVersion=vNumCalc.replace(/[A-Z]/g,"").replace(/[a-z]/g,"").replace(/[-]/g,"").replace(/[;]/g,""); // make relatively sure we're dealing with a number
    var androidVersionNumber = parseFloat(androidVersion); 
    var versionToTest = parseFloat('3'); // use parse float here so we can test for specific sub versions    
    //
    // see if out number is above or below 3 add class if overflow and fixed are unsupported
    //
    if(androidVersionNumber >= versionToTest){
      $('html').addClass('android'); // it's an android 
      console.log("android is greater then 3. Overflow and fixed OK!");
    } else if(androidVersionNumber < versionToTest && vNum != undefined) {
      $('html').addClass('android'); // it's an android 
      $('html').addClass('lt-android-3');
      console.log("android is less then 3. Overflow and fixed FAIL");
    }

    if(/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) { 
        if(/OS [2-4]_\d(_\d)? like Mac OS X/i.test(navigator.userAgent)) {  
        $('html').addClass('lt-ios5');
        } else if(/CPU like Mac OS X/i.test(navigator.userAgent)) {
        $('html').addClass('lt-ios5');
        } else {
            // iOS 5 or Newer
            $('html').addClass('ios');
        }
    }

})(jQuery); // end jquery ready 