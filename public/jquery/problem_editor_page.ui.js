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
            $('#problem_editor_page').on('click', '#generate', async function(){
                const formdata = {};
                $('#problem_editor_page').serializeArray().map(x => {formdata[x.name]=x.value;});
                const request ={method:'post', body: JSON.stringify(formdata)}
                const response = await $.ui._api('problem_editor_page/generate', request);
                console.log(response);
                $('#question').text(response['question']);
                $('#answer').text(response['answer']);
            })
        }
        
    });
    $(function(){
        
        $.ui._init();
    })
}(window, document, jQuery))