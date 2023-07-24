(function (window, document, $, undefined){
    $.extend({ui:{}, var:{}});
    $.extend($.ui, {
        _api:async function(url, request){
            request['mode'] = 'cors';
            request['credentials'] = 'same-origin';
            request['headers'] = {"Content-Type": "application/json",};
            request['redirect'] = 'follow';
            request['referrerPolicy'] = 'no-referrer';
            let data = await fetch(url, request)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((_data) =>{
                    return _data;
                });
            return data;
        },
        _init: function(){
            $('#corrections_page').on('keyup', '#error', async function(){
                const obj = {text:$("#error").text()};
                const request ={method:'post', body: JSON.stringify(obj)}
                const response = await $.ui._api('corrections_page/correct', request);
                $("#correct").text(response['text'])
                console.log(response);
            })
        }
        
    });
    $(function(){
        $.ui._init();
    })
}(window, document, jQuery))