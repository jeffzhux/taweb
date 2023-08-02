import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const MESSAGE_TYPE_OFFER = 0x01;
const MESSAGE_TYPE_ANSWER = 0x02;
const MESSAGE_TYPE_CANDIDATE = 0x03;
const MESSAGE_TYPE_HANGUP = 0x04;
const LEFT_EYE_IDX = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE_IDX = [33, 160, 158, 133, 153, 144];
const EYE_AR_THRESH = 0.35;
const EYE_AR_CONSEC_FRAMES = 48;
class RTCPeerConnectionWrapper{
    constructor(localUserId, remoteUserId, localStream, socket, masterId, faceLandmarker){
        this.localUserId = localUserId;
        this.remoteUserId = remoteUserId;
        this.pc = this.create(localStream);
        this.masterId = masterId
        this.socket = socket;
        this.remoteSdp = null;
        
        this.faceLandmarker = faceLandmarker;
        this.eye_ar_counter = 0;
    }
    create_video_canvas(){
        
        this.remoteVideo = document.createElement("video");
        this.remoteCanvas = document.createElement("canvas"); 
        this.remoteCanvas.style.position = 'absolute';
        this.div = document.createElement("div");
        this.div.id = this.remoteUserId;
        this.div.style.display="flex";
        

    }
    create(stream){
        this.create_video_canvas();
        // 建立p2p連線
        const configuration = {
            iceServers: [{
                urls: 'stun:stun.l.google.com:19302' // Google's public STUN server
            }]
        };
        const pc = new RTCPeerConnection(configuration);
        
        pc.onicecandidate = this.onIceCandidates.bind(this);
        pc.onconnectionstatechange = (evt) => {console.log('ICE 伺服器狀態變更 => ', evt.target.iceConnectionState);}
        pc.onaddstream = this.onRemoteStreamAdded.bind(this);
        pc.addStream(stream);
        console.log('create peer connection');
        return pc
    }
    async createOffer(){
        const localSDP = await this.pc['createOffer']({
                offerToReceiveAudio: 1, //是否傳送聲音留給對方
                offerToReceiveVideo: 1, //是否傳送影像留給對方
        });
        await this.pc.setLocalDescription(localSDP);
        this.socket.emit("broadcast", {
            'userId': this.localUserId,
            'masterId': this.masterId,
            'msgType': MESSAGE_TYPE_OFFER,
            'sdp': this.pc.localDescription,
            'targetUserId': this.remoteUserId
        });
    }
    async createAnswer(){
        const localSDP = await this.pc['createAnswer']({
            offerToReceiveAudio: 1, //是否傳送聲音留給對方
            offerToReceiveVideo: 1, //是否傳送影像留給對方
        });
        await this.pc.setLocalDescription(localSDP);
        this.socket.emit("broadcast", {
            'userId': this.localUserId,
            'masterId': this.masterId,
            'msgType': MESSAGE_TYPE_ANSWER,
            'sdp': this.pc.localDescription,
            'targetUserId': this.remoteUserId
        });
        
    }
    onIceCandidates(event){
        // 監聽 ICE Server
        // 找尋到 ICE 候選位置後，送去 Server 與另一位配對
        if(!event || event.candidate == null) {
            return;
        }
        var message = {
            'userId': this.localUserId,
            'masterId': this.masterId,
            'msgType': MESSAGE_TYPE_CANDIDATE,
            'id': event.candidate.sdpMid,
            'label': event.candidate.sdpMLineIndex,
            'candidate': event.candidate.candidate,
            'targetUserId': this.remoteUserId
        }
        this.socket.emit('broadcast', message);
        

    }
    onRemoteStreamAdded(event){
        const videoGrid = document.getElementById("video-grid");
        if(!this.remoteVideo.srcObject && event.stream){
            this.remoteVideo.srcObject = event.stream;
            this.remoteVideo.play();
            
            
            this.div.append(this.remoteVideo);
            this.div.append(this.remoteCanvas);

            videoGrid.append(this.div);
            // console.log('接收流並顯示於遠端視訊！', event);
            if(this.faceLandmarker != null){
                this.remoteVideo.addEventListener("loadeddata", this.predictWebcam.bind(this));
            }
        }
    }
    async setRemoteDescription(sessionDescription){
        if(this.remoteSdp != null || sessionDescription==null){
            return
        }
        this.remoteSdp = sessionDescription;
        await this.pc.setRemoteDescription(new RTCSessionDescription(sessionDescription));
    }
    addIceCandidate(candidate){
        this.pc.addIceCandidate(candidate);
    }
    EAR(point){
        const euclideanDistance = (a, b) => Math.hypot(...Object.keys(a).map(k => b[k]-a[k]));
        return (euclideanDistance(point[1], point[5]) + euclideanDistance(point[2], point[4])) / (2*euclideanDistance(point[0], point[3]));
    }
    async predictWebcam(){
        if(this.remoteVideo){
            const results = this.faceLandmarker.detectForVideo(this.remoteVideo, Date.now());
            const leftP = []
            const rightP = []
            try{
                for(let i = 0; i < LEFT_EYE_IDX.length; i++){
                    leftP.push(results.faceLandmarks[0][LEFT_EYE_IDX[i]]);
                    rightP.push(results.faceLandmarks[0][RIGHT_EYE_IDX[i]]);
                }
                const ear = this.EAR(leftP) + this.EAR(rightP);
                const ctx = this.remoteCanvas.getContext('2d');
                ctx.clearRect(0, 0, this.remoteCanvas.width, this.remoteCanvas.height);
                if(ear < EYE_AR_THRESH){
                    this.eye_ar_counter += 1;
                }
                else{
                    this.eye_ar_counter = 0;
                }
                if(this.eye_ar_counter > EYE_AR_CONSEC_FRAMES){
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
            window.requestAnimationFrame(this.predictWebcam.bind(this));
        }
    }
}


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
        masterId: null,
        roomId:'20230725',
        localUserId: null,
        localVideo: null,
        localStream: null,
        peerConnections: [],
        
        faceLandmarker: null
    })
    $.extend($.ui, {
        /*
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
        */
        _init: function(){
            $.var.socket.on('connect',async function(){
                console.log('self socket ' + $.var.socket.id);
                $.var.localUserId = $.var.socket.id;
                
                $.ui.createMedia().then(()=>{
                    $.var.socket.emit('joinRoom', {'userId':$.var.localUserId, 'roomId':$.var.roomId});
                });
                
            })
            $.var.socket.on('set-master', async function(masterId){
                if($.var.masterId == null){
                    //設定房主
                    $.var.masterId = masterId;
                }
            })
            $.var.socket.on('user-joined',async function(remoteUserId){
                
                if ($.var.localUserId == remoteUserId) {
                    return;
                }
                console.log('socket 用戶加入 ' + remoteUserId);
                if ($.var.peerConnections[remoteUserId] == null) {
                    $.var.peerConnections[remoteUserId] = await new RTCPeerConnectionWrapper($.var.localUserId, remoteUserId, $.var.localStream, $.var.socket, $.var.masterId, $.var.faceLandmarker);
                }
                await $.var.peerConnections[remoteUserId].createOffer();
            })
            $.var.socket.on('broadcast', async function(msg){
                if (msg.userId == $.var.userId){
                    return;
                }
                // if message is not send to me. ignore it
                if (msg.targetUserId && msg.targetUserId != $.var.localUserId) {
                    return;
                }
                switch(msg.msgType){
                    case MESSAGE_TYPE_OFFER:
                        await $.ui.handleRemoteOffer(msg);
                        break;
                    case MESSAGE_TYPE_ANSWER:
                        await $.ui.handleRemoteAnswer(msg);
                        break;
                    case MESSAGE_TYPE_CANDIDATE:
                        await $.ui.handleRemoteCandidate(msg);
                        break;
                }
            })
            $.var.socket.on('user-leaved', function(remoteUserId){
                console.log('socket 用戶離開 ' + remoteUserId);
                if($.var.masterId == remoteUserId){
                    window.location.replace("https://140.120.182.145:8080/problem_editor");
                }
                document.getElementById(remoteUserId).remove();
                if ($.var.localUserId == remoteUserId) {
                    return;
                }
                delete $.var.peerConnections[remoteUserId];
            })
        },
        handleRemoteOffer: async function(msg){
            console.log('Remote offer received: ', msg.userId);

            $.var.peerConnections[msg.userId] = await new RTCPeerConnectionWrapper($.var.localUserId, msg.userId, $.var.localStream, $.var.socket, $.var.masterId, $.var.faceLandmarker);
            await $.var.peerConnections[msg.userId].setRemoteDescription(msg.sdp);
            await $.var.peerConnections[msg.userId].createAnswer();

        },
        handleRemoteAnswer: async function(msg){
            console.log('Remote answer received: ', msg.userId);
            if ($.var.peerConnections[msg.userId] == null) {
                console.log('Invlid state, can not find the offerer ', msg.userId);
                return;
            }
            await $.var.peerConnections[msg.userId].setRemoteDescription(msg.sdp);
        },
        handleRemoteCandidate: async function(msg){
            console.log('Remote candidate received: ', msg.userId);
            if ($.var.peerConnections[msg.userId] == null) {
                console.log('Invlid state, can not find the offerer ', msg.userId);
                return;
            }
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: msg.label,
                candidate: msg.candidate
            });
            $.var.peerConnections[msg.userId].addIceCandidate(candidate);
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
                div.id = $.var.localUserId;
                div.style.display="flex";
                div.append($.var.localVideo);
                videoGrid.append(div);
            });
            console.log($.var.localStream.getVideoTracks()[0].label);
            console.log($.var.localStream.getAudioTracks()[0].label);
        },
        checkRoom:function(){
            var url_params = new URLSearchParams(window.location.search);
            console.log(url_params);
            console.log(url_params.has('id'));
            console.log(url_params.get('id'));
            if (url_params.has('id')){
                $.var.roomId = url_params.get('id');
                return true;
            }
            else{
                window.location.replace("https://140.120.182.145:8080/problem_editor");
            }
            
        },
        _initModel: async function(){
            const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
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
        const isRoomExist = $.ui.checkRoom();
        if(isRoomExist){
            // $.ui._initModel().then($.ui._init);
            $.ui._initModel();
            $.ui._init();
        }
    });

}(window, document, jQuery))