import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
(function (window, document, $, undefined){
    
    $.extend({ui:{}, var:{}});
    $.extend($.var,{
        constrains:{
            audio:true,
            video:true
            // video: {
            //     width: { min: 1024, ideal: 1280, max: 1920 },
            //     height: { min: 776, ideal: 720, max: 1080 }
            //   }
        },
        socket: io('https://140.120.182.145:8080'),
        localVideo: null,
        localStream: null,
        remoteVideo: null,
        remoteCanvas: null,
        pc: null,
        offer: null,
        faceLandmarker:null,
        leftEyeIdx:[362, 385, 387, 263, 373, 380],
        rightEyeIdx:[33, 160, 158, 133, 153, 144],
        EYE_AR_THRESH: 0.35,
        EYE_AR_CONSEC_FRAMES: 48,
        EYE_AR_COUNTER:0,
    })
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
            $.var.socket.on('joinSuccess', function(data){
                console.log(data);
            })
            $.var.socket.on('peerconnectSignaling', async function({ desc, candidate }){
                // desc 指的是 Offer 與 Answer
                // currentRemoteDescription 代表的是最近一次連線成功的相關訊息
                if (desc && !$.var.pc.currentRemoteDescription) {
                    console.log('desc => ', desc);
                    
                    await $.var.pc.setRemoteDescription(new RTCSessionDescription(desc));
                    $.ui.createSignal(desc.type === 'answer' ? true : false);
                } else if (candidate) {
                    // 新增對方 IP 候選位置
                    console.log('candidate =>', candidate);
                    $.var.pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
            })
        },
        createMedia:async function(){
            const videoGrid = document.getElementById("video-grid");
            $.var.localVideo = document.createElement("video");
            $.var.localVideo.muted = true;

            $.var.localStream = await navigator.mediaDevices.getUserMedia($.var.constrains);
            $.var.localVideo.srcObject = $.var.localStream;
            $.var.localVideo.addEventListener("loadedmetadata", () => {
                $.var.localVideo.play();
                const div = document.createElement("div");
                div.append($.var.localVideo);
                videoGrid.append(div);
            });
            console.log($.var.localStream.getVideoTracks()[0].label);
            console.log($.var.localStream.getAudioTracks()[0].label);
        },
        createPeerConnection:async function(){
            // 建立p2p連線
            const configuration = {
                iceServers: [{
                    urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
                }]
            };
            $.var.pc = new RTCPeerConnection(configuration);
            console.log('create peer connection');
        },
        addLocalStream: function(){
            $.var.pc.addStream($.var.localStream);
        },

        onIceCandidates: function() {
            // 監聽 ICE Server
            // 找尋到 ICE 候選位置後，送去 Server 與另一位配對
            $.var.pc.onicecandidate = ({ candidate }) => {
                if (!candidate) { return; }
                $.var.socket.emit("peerconnectSignaling", { 
                    candidate,
                    to: 'jedy-0',
                    from: 'hiro-1',
                    room: '0509'
                 });
            };
        },

        onIceconnectionStateChange: function() {
            // 監聽 ICE 連接狀態
            $.var.pc.oniceconnectionstatechange = (evt) => {
                console.log('ICE 伺服器狀態變更 => ', evt.target.iceConnectionState);
            };
        },

        onAddStream:async function() {
            // 監聽是否有流傳入，如果有的話就顯示影像            
            $.var.pc.onaddstream = (event) => {
                const videoGrid = document.getElementById("video-grid");
                const div = document.createElement("div");
                div.style.display="flex";
                $.var.remoteCanvas = document.createElement("canvas");
                $.var.remoteCanvas.style.position = 'absolute';
                $.var.remoteVideo = document.createElement("video");
                if(!$.var.remoteVideo.srcObject && event.stream){
                    $.var.remoteVideo.srcObject = event.stream;
                    $.var.remoteVideo.play();
                    
                    div.append($.var.remoteVideo);
                    div.append($.var.remoteCanvas);

                    videoGrid.append(div);
                    $.var.remoteVideo.addEventListener("loadeddata", $.ui.predictWebcam);
                    console.log('接收流並顯示於遠端視訊！', event);
                    
                }
            }
        },
        // ---------------------
        sendSignalingMessage: function(desc, offer) {

            const isOffer = offer ? "offer" : "answer";
            console.log(`寄出 ${isOffer}`);
            $.var.socket.emit("peerconnectSignaling", {
              desc: desc,
              to: 'jedy-0',
              from: 'hiro-1',
              room: '0509'
            });
        },
        createSignal: async function(isOffer) {
            try {
                if (!$.var.pc) {
                    console.log('尚未開啟視訊')
                    return;
                }
                
                //乎叫 peerConnect 內的 createOffer / createAnswer
                $.var.offer = await $.var.pc[`create${isOffer ? 'Offer' : 'Answer'}`]({
                    offerToReceiveAudio: 1, //是否傳送聲音留給對方
                    offerToReceiveVideo: 1, //是否傳送影像留給對方
                });
                
                // 設定本地流配置
                await $.var.pc.setLocalDescription($.var.offer);
                $.ui.sendSignalingMessage($.var.pc.localDescription, isOffer ? true : false)
            } catch(err) {
                console.log(err);
            }
        },
        onSocket: function(){
            // desc 指的是 Offer 與 Answer
            // currentRemoteDescription 代表的是最近一次連線成功的相關訊息
            $.var.socket.on('peerconnectSignaling', async ({desc, from, candidate}) =>{
                if (desc && !$.var.pc.currentRemoteDescription) {
                    console.log('desc => ', desc);
                    await $.var.pc.setRemoteDescription(new RTCSessionDescription(desc));
                    await $.ui.createSignal(desc.type === 'answer' ? true : false);
                } else if (candidate) {
                    // 新增對方 IP 候選位置
                    console.log('candidate =>', candidate);
                    $.var.pc.addIceCandidate(new RTCIceCandidate(candidate));
                }
            });
            $.var.socket.on('roomBroadcast', message => {
                console.log('房間廣播 => ', message);
            });
        },
        joinRoom: function() {
            console.log("joinRoom");
            $.var.socket.emit('joinRoom' , 'secret room');
        },
        _initModel: async function(){
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
            );
            $.var.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                  modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                  delegate: "CPU"
                },
                outputFaceBlendshapes: true,
                runningMode:"VIDEO",
                numFaces: 1
            });
        },
        EAR: function(p){
            const euclideanDistance = (a, b) => Math.hypot(...Object.keys(a).map(k => b[k]-a[k]));
            return (euclideanDistance(p[1], p[5]) + euclideanDistance(p[2], p[4])) / (2*euclideanDistance(p[0], p[3]));
        },
        predictWebcam: async function(){
            if($.var.remoteVideo){
                const results = $.var.faceLandmarker.detectForVideo($.var.remoteVideo, Date.now());
                const leftP = []
                const rightP = []
                try{
                    for(let i = 0; i < $.var.leftEyeIdx.length; i++){
                        leftP.push(results.faceLandmarks[0][$.var.leftEyeIdx[i]]);
                        rightP.push(results.faceLandmarks[0][$.var.rightEyeIdx[i]]);
                    }
                    const ear = $.ui.EAR(leftP) + $.ui.EAR(rightP);
                    const ctx = $.var.remoteCanvas.getContext('2d');
                    ctx.clearRect(0, 0, $.var.remoteCanvas.width, $.var.remoteCanvas.height);
                    if(ear < $.var.EYE_AR_THRESH){
                        $.var.EYE_AR_COUNTER += 1;
                    }
                    else{
                        $.var.EYE_AR_COUNTER = 0;
                    }
                    if($.var.EYE_AR_COUNTER > $.var.EYE_AR_CONSEC_FRAMES){
                        ctx.font = "20px";
                        ctx.fillStyle = "#F4606C";
                        ctx.fillText("Distract: " + Math.round(ear *100)/100,10, 30);
                    }
                    else{
                        ctx.font = "20px Verdana";
                        ctx.fillStyle = "#8bc34a";
                        ctx.fillText("Sober: " + Math.round(ear *100)/100,10, 30);
                    }
                    
                }catch(err){
                    console.log(err);
                }
                window.requestAnimationFrame($.ui.predictWebcam);
            }
            

        }
    });
    $(function(){
        $.ui.createPeerConnection();
        $.ui.onIceCandidates();
        $.ui.onIceconnectionStateChange();
        $.ui._init();
        $.ui._initModel()
        .then($.ui.createMedia)
        .then(function(){
            $.ui.addLocalStream();
            $.ui.onAddStream();
        }).then(function(){
            $.ui.createSignal(true);
        });
        // $.ui._initModel();
        
        // $.ui.joinRoom();
        
    });

}(window, document, jQuery))