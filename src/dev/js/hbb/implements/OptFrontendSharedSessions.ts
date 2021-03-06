require('script-loader!../../lib/togetherjs/togetherjs-min.js');

import { Assert } from '../utilities/debugger';
import { OptFrontend } from './OptFrontend';
import { supports_HTML5_storage } from '../utilities/functions';

export var TogetherJS = (window as any).TogetherJS;
var togetherjsInUrl = !!(window.location.hash.match(/^#togetherjs/)); // turn into bool

export class OptFrontendSharedSessions extends OptFrontend implements IOptFrontendSharedSessions {
    executeCodeSignalFromRemote = false;
    togetherjsSyncRequested = false;
    pendingCodeOutputScrollTop = null;
    updateOutputSignalFromRemote = false;

    constructor(params = {}) {
        super(params);
        this.initTogetherJS();
        this.pyInputAceEditor.getSession().on("change", (e) => {
            // unfortunately, Ace doesn't detect whether a change was caused by a setValue call
            if (TogetherJS.running) {
                TogetherJS.send({ type: "codemirror-edit" });
            }
        });

        // add an additional listener in addition to whatever the superclass/ added
        window.addEventListener("hashchange", (e) => {
            if (TogetherJS.running && !this.isExecutingCode) {
                TogetherJS.send({
                    type: "hashchange",
                    appMode: this.appMode,
                    codeInputScrollTop: this.pyInputGetScrollTop(),
                    myAppState: this.getAppState()
                });
            }
        });
    }

    ignoreAjaxError(settings: any): boolean {
        if (settings.url.indexOf('togetherjs') > -1) {
            return true;
        } else {
            return super.ignoreAjaxError(settings);
        }
    }
    
    logEditDelta(delta: any): void {
        super.logEditDelta(delta);
        if (TogetherJS.running) {
            TogetherJS.send({ type: "editCode", delta: delta });
        }
    }
    
    startExecutingCode(startingInstruction = 0): void {
        if (TogetherJS.running && !this.executeCodeSignalFromRemote) {
            TogetherJS.send({
                type: "executeCode",
                myAppState: this.getAppState(),
                forceStartingInstr: startingInstruction,
                rawInputLst: this.rawInputLst
            });
        }

        super.startExecutingCode(startingInstruction);
    }
    
    updateAppDisplay(newAppMode: any): void {
        super.updateAppDisplay(newAppMode); // do this first!

        // now this.appMode should be canonicalized to either 'edit' or 'display'
        if (this.appMode === 'edit') {
            // pass
        } else if (this.appMode === 'display') {
            Assert(this.myVisualizer);

            if (!TogetherJS.running) {
                $("#surveyHeader").show();
            }

            if (this.pendingCodeOutputScrollTop) {
                this.myVisualizer.domRoot.find('#pyCodeOutputDiv').scrollTop(this.pendingCodeOutputScrollTop);
                this.pendingCodeOutputScrollTop = null;
            }

            $.doTimeout('pyCodeOutputDivScroll'); // cancel any prior scheduled calls

            // TODO: this might interfere with experimentalPopUpSyntaxErrorSurvey (2015-04-19)
            this.myVisualizer.domRoot.find('#pyCodeOutputDiv').scroll(function (e) {
                let elt = $(this);
                // debounce
                $.doTimeout('pyCodeOutputDivScroll', 100, function () {
                    // note that this will send a signal back and forth both ways
                    if (TogetherJS.running) {
                        /*  (there's no easy way to prevent this), but it shouldn't keep
                            bouncing back and forth indefinitely since no the second signal
                            causes no additional scrolling */
                        TogetherJS.send({
                            type: "pyCodeOutputDivScroll",
                            scrollTop: elt.scrollTop()
                        });
                    }
                });
            });
        } else {
            Assert(false);
        }
    }
    
    finishSuccessfulExecution(): void {
        Assert(this.myVisualizer);

        this.myVisualizer.add_pytutor_hook("end_updateOutput", (args) => {
            if (this.updateOutputSignalFromRemote) {
                return [true]; // die early; no more hooks should run after this one!
            }

            if (TogetherJS.running && !this.isExecutingCode) {
                TogetherJS.send({ type: "updateOutput", step: args.myViz.curInstr });
            }
            return [false]; // pass through to let other hooks keep handling
        });

        /*  do this late since we want the hook in this function to be installed
            FIRST so that it can run before the hook installed by our superclass */
        super.finishSuccessfulExecution();

        /*  VERY SUBTLE -- reinitialize TogetherJS at the END so that it can detect
            and sync any new elements that are now inside myVisualizer */
        if (TogetherJS.running) {
            TogetherJS.reinitialize();
        }
    }

    initTogetherJS(): void {
        Assert(TogetherJS);

        if (togetherjsInUrl) { // kinda gross global
            $("#ssDiv,#surveyHeader,#adHeader").hide(); // hide ASAP!
            $("#togetherjsStatus").html("Please wait ... loading shared session");
        }

        // clear your name from the cache every time to prevent privacy leaks
        if (supports_HTML5_storage()) {
            localStorage.removeItem('togetherjs.settings.name');
        }

        /*  This event triggers when you first join a session and say 'hello',
            and then one of your peers says hello back to you. If they have the
            exact same name as you, then change your own name to avoid ambiguity.
            Remember, they were here first (that's why they're saying 'hello-back'),
            so they keep their own name, but you need to change yours :) */
        TogetherJS.hub.on("togetherjs.hello-back", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            let p = TogetherJS.require("peers");

            let peerNames = p.getAllPeers().map(e => e.name);

            if (msg.name == p.Self.name) {
                let newName = undefined;
                let toks = msg.name.split(' ');
                let count = Number(toks[1]);

                // make sure the name is truly unique, incrementing count as necessary
                do {
                    if (!isNaN(count)) {
                        newName = toks[0] + ' ' + String(count + 1); // e.g., "Tutor 3"
                        count++;
                    } else {
                        // the original name was something like "Tutor", so make newName into, say, "Tutor 2"
                        newName = p.Self.name + ' 2';
                        count = 2;
                    }
                } while ($.inArray(newName, peerNames) >= 0); // i.e., is newName in peerNames?

                p.Self.update({ name: newName }); // change our own name
            }
        });

        TogetherJS.hub.on("updateOutput", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            if (this.isExecutingCode) {
                return;
            }

            if (this.myVisualizer) {
                // to prevent this call to updateOutput from firing its own TogetherJS event
                this.updateOutputSignalFromRemote = true;
                try {
                    this.myVisualizer.renderStep(msg.step);
                } finally {
                    this.updateOutputSignalFromRemote = false;
                }
            }
        });

        TogetherJS.hub.on("executeCode", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            if (this.isExecutingCode) {
                return;
            }

            this.executeCodeSignalFromRemote = true;
            try {
                this.executeCode(msg.forceStartingInstr, msg.rawInputLst);
            } finally {
                this.executeCodeSignalFromRemote = false;
            }
        });

        TogetherJS.hub.on("hashchange", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            if (this.isExecutingCode) {
                return;
            }

            console.log("TogetherJS RECEIVE hashchange", msg.appMode);
            if (msg.appMode != this.appMode) {
                this.updateAppDisplay(msg.appMode);

                if (this.appMode == 'edit' && msg.codeInputScrollTop !== undefined &&
                    this.pyInputGetScrollTop() != msg.codeInputScrollTop) {
                    // hack: give it a bit of time to settle first ...
                    $.doTimeout('pyInputCodeMirrorInit', 200, () => {
                        this.pyInputSetScrollTop(msg.codeInputScrollTop);
                    });
                }
            }
        });

        TogetherJS.hub.on("codemirror-edit", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            $("#codeInputWarnings").hide();
            $("#someoneIsTypingDiv").show();

            $.doTimeout('codeMirrorWarningTimeout', 500, () => { // debounce
                $("#codeInputWarnings").show();
                $("#someoneIsTypingDiv").hide();
            });
        });

        TogetherJS.hub.on("requestSync", (msg) => {
            // DON'T USE msg.sameUrl check here since it doesn't work properly
            TogetherJS.send({
                type: "myAppState",
                myAppState: this.getAppState(),
                codeInputScrollTop: this.pyInputGetScrollTop(),
                pyCodeOutputDivScrollTop: this.myVisualizer ?
                    this.myVisualizer.domRoot.find('#pyCodeOutputDiv').scrollTop() :
                    undefined
            });
        });

        TogetherJS.hub.on("myAppState", (msg) => {
            // DON'T USE msg.sameUrl check here since it doesn't work properly
            // if we didn't explicitly request a sync, then don't do anything
            if (!this.togetherjsSyncRequested) {
                return;
            }

            this.togetherjsSyncRequested = false;
            let learnerAppState = msg.myAppState;

            if (learnerAppState.mode == 'display') {
                if (OptFrontendSharedSessions.appStateEq(this.getAppState(), learnerAppState)) {
                    // update curInstr only
                    this.myVisualizer.renderStep(learnerAppState.curInstr);

                    if (msg.pyCodeOutputDivScrollTop !== undefined) {
                        this.myVisualizer.domRoot.find('#pyCodeOutputDiv').scrollTop(msg.pyCodeOutputDivScrollTop);
                    }
                } else if (!this.isExecutingCode) { // if already executing from a prior signal, ignore
                    this.syncAppState(learnerAppState);

                    this.executeCodeSignalFromRemote = true;
                    try {
                        if (msg.pyCodeOutputDivScrollTop !== undefined) {
                            this.pendingCodeOutputScrollTop = msg.pyCodeOutputDivScrollTop;
                        }
                        this.executeCode(learnerAppState.curInstr);
                    } finally {
                        this.executeCodeSignalFromRemote = false;
                    }
                }
            } else {
                Assert(learnerAppState.mode == 'edit');
                if (!OptFrontendSharedSessions.appStateEq(this.getAppState(), learnerAppState)) {
                    this.syncAppState(learnerAppState);
                    this.enterEditMode();
                }
            }

            if (msg.codeInputScrollTop !== undefined) {
                /*  give pyInputAceEditor a bit of time to settle with
                    its new value. this is hacky; ideally we have a callback for
                    when setValue() completes. */
                $.doTimeout('pyInputCodeMirrorInit', 200, () => {
                    this.pyInputSetScrollTop(msg.codeInputScrollTop);
                });
            }
        });

        TogetherJS.hub.on("syncAppState", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            this.syncAppState(msg.myAppState);
        });

        TogetherJS.hub.on("codeInputScroll", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            // don't sync for Ace editor since I can't get it working properly yet
        });

        TogetherJS.hub.on("pyCodeOutputDivScroll", (msg) => {
            if (!msg.sameUrl) return; // make sure we're on the same page
            if (this.myVisualizer) {
                this.myVisualizer.domRoot.find('#pyCodeOutputDiv').scrollTop(msg.scrollTop);
            }
        });

        $("#sharedSessionBtn").click(this.startSharedSession.bind(this));
        $("#stopTogetherJSBtn").click(TogetherJS); // toggles off

        /*  fired when TogetherJS is activated. might fire on page load if there's
            already an open session from a prior page load in the recent past. */
        TogetherJS.on("ready", () => {
            $("#sharedSessionDisplayDiv").show();
            $("#adInfo,#ssDiv,#adHeader,#testCasesParent").hide();

            /*  send this to the server for the purposes of logging, but other
                clients shouldn't do anything with this data */
            if (TogetherJS.running) {
                TogetherJS.send({
                    type: "initialAppState",
                    myAppState: this.getAppState(),
                    user_uuid: this.userUUID,
                    /*  so that you can tell whether someone else shared
                        a TogetherJS URL with you to invite you into this shared session: */
                    togetherjsInUrl: togetherjsInUrl
                }); // kinda gross global
            }

            /*  immediately try to sync upon startup so that if
                others are already in the session, we will be
                synced up. and if nobody is here, then this is a NOP. */
            this.requestSync();
            this.TogetherjsReadyHandler();
            this.redrawConnectors(); // update all arrows at the end
        });

        /*  emitted when TogetherJS is closed. This is not emitted when the
            webpage simply closes or navigates elsewhere, ONLY when TogetherJS
            is explicitly stopped via a call to TogetherJS() */
        TogetherJS.on("close", () => {
            $("#togetherjsStatus").html(''); // clear it
            $("#sharedSessionDisplayDiv").hide();
            $("#adInfo,#ssDiv,#adHeader,#testCasesParent").show();
            this.TogetherjsCloseHandler();
            this.redrawConnectors(); // update all arrows at the end
        });
    }
    
    requestSync(): void {
        if (TogetherJS.running) {
            this.togetherjsSyncRequested = true;
            TogetherJS.send({ type: "requestSync" });
        }
    }
    
    syncAppState(appState: any): void {
        this.setToggleOptions(appState);

        /*  VERY VERY subtle -- temporarily prevent TogetherJS from sending
            form update events while we set the input value. otherwise
            this will send an incorrect delta to the other end and screw things
            up because the initial states of the two forms aren't equal. */
        let orig = TogetherJS.config.get('ignoreForms');
        TogetherJS.config('ignoreForms', true);
        this.pyInputSetValue(appState.code);
        TogetherJS.config('ignoreForms', orig);

        if (appState.rawInputLst) {
            this.rawInputLst = $.parseJSON(appState.rawInputLstJSON);
        } else {
            this.rawInputLst = [];
        }
    }
    
    TogetherjsReadyHandler(): void {
        $("#surveyHeader").hide();
        this.populateTogetherJsShareUrl();
    }
    
    TogetherjsCloseHandler(): void {
        if (this.appMode === "display") {
            $("#surveyHeader").show();
        }
    }
    
    startSharedSession(): void {
        $("#ssDiv,#surveyHeader,#adHeader").hide(); // hide ASAP!
        $("#togetherjsStatus").html("Please wait ... loading shared session");
        TogetherJS();
    }
    
    static appStateEq(s1: any, s2: any): any { // return whether two states match, except don't worry about curInstr
        Assert(s1.origin == s2.origin); // sanity check!

        return (s1.code == s2.code &&
            s1.mode == s2.mode &&
            s1.cumulative == s2.cumulative &&
            s1.heapPrimitives == s1.heapPrimitives &&
            s1.textReferences == s2.textReferences &&
            s1.py == s2.py &&
            s1.rawInputLstJSON == s2.rawInputLstJSON);
    }
    
    populateTogetherJsShareUrl(): void {
        // without anything after the '#' in the hash
        let cleanUrl = $.param.fragment(location.href, {}, 2); // 2 means 'override'

        let shareId = TogetherJS.shareId();
        Assert(shareId); // make sure we're not attempting to access shareId before it's set

        let urlToShare = cleanUrl + 'togetherjs=' + shareId;
        $("#togetherjsStatus").html(`
        <div>
            Send the URL below to invite someone to join this shared session:
        </div>
        <input type="text" style="font-size: 10pt; font-weight: bold; padding: 4px; margin-top: 3pt; margin-bottom: 6pt;"
        id="togetherjsURL" size="80" readonly="readonly"/>`);

        let extraHtml = `<div style="margin-top: 3px; margin-bottom: 10px; font-size: 8pt;">
        For best results, do not click or move around too quickly, and press "Force sync" if you get out of sync: 
        <button id="syncBtn" type="button">Force sync</button><br/>
        <a href="https://docs.google.com/forms/d/126ZijTGux_peoDusn1F9C1prkR226897DQ0MTTB5Q4M/viewform" target="_blank">Report bugs and feedback</a> 
        on this shared sessions feature.</div>`;        
        $("#togetherjsStatus").append(extraHtml);

        $("#togetherjsURL").val(urlToShare).attr('size', urlToShare.length + 20);
        $("#syncBtn").click(this.requestSync.bind(this));
    }

}