var MicrosoftXmlHttpRequestConnection = (function() {
    "use strict";

    /**
     * Creates an instance of MicrosoftXmlHttpRequestConnection object
     *
     * @constructor
     */
    /* jshint -W117 */
    var MicrosoftXmlHttpRequestConnection = function () {

        this._xhr = new ActiveXObject("Microsoft.XMLHTTP");

        /**
         * Basic request implemented via XHR technique
         *
         * @method execute
         * @param request {Request} structure containing all needed params and data
         * @param callback {function} function, which will be executed on request success
         */
        this.execute = function(request, callback) {

            var XHR = this._xhr,
                headerType;

            // Create the state change handler:
            XHR.onreadystatechange = function() {
                if (XHR.readyState != 4) {return;} // Not ready yet
                if (XHR.status >= 400) {
                    callback(
                        new CAPIError({
                            errorText : "Connection error : " + XHR.status,
                            errorCode : XHR.status
                        }),
                        new Response({
                            status : XHR.status,
                            headers : XHR.getAllResponseHeaders(),
                            body : XHR.responseText
                        })
                    );
                    return;
                }
                // Request successful
                callback(
                    false,
                    new Response({
                        status : XHR.status,
                        headers : XHR.getAllResponseHeaders(),
                        body : XHR.responseText
                    })
                );
            };

            if (request.httpBasicAuth) {
                XHR.open(request.method, request.url, true, request.login, request.password);
            } else {
                XHR.open(request.method, request.url, true);
            }


            for (headerType in request.headers) {
                if (request.headers.hasOwnProperty(headerType)) {
                    XHR.setRequestHeader(
                        headerType,
                        request.headers[headerType]
                    );
                }
            }
            XHR.send(request.body);
        };
    };
    /* jshint +W117 */

    // static method
    MicrosoftXmlHttpRequestConnection.isCompatible = function(){
        return !!window.ActiveXObject;
    };

    return MicrosoftXmlHttpRequestConnection;

}());