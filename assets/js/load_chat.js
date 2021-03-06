(function () {
    var options = {
        id: 13976,
        hash: "6356592de428f11b5e8ea54ccdecfc0a",
        base_domain: "v2.libanswers.com",
        iid: 1315,
        onlinerules: [
            { u: 0, d: [1916], c: "" },
            { u: 0, d: [1250], c: "" },
        ],
        width: 400,
        height: 340,
        color_backg: "#f9f9f9",
        color_head: "#58595B",
        color_btn: "#FFFFFF",
        offline_url: "https://libanswers.utk.edu",
        autoload_head: "Do you need help?",
        autoload_text: "A librarian is online ready to help.",
        autoload_yes: "Chat Now",
        autoload_no: "No Thanks",
        autoload_time: 0,
        cal_url: "",
        cal_text: "Schedule a Meeting",
        cal_autoload: false,
        slidebutton_url: "",
        slidebutton_url_off: "",
        slidebutton_text: "Chat",
        slidebutton_text_off: "Chat Offline",
        slidebutton_width: "auto",
        slidebutton_height: "auto",
        slidebutton_bcolor_off: "#58595B",
        slidebutton_color_off: "#E0E0E0",
        slidebutton_bcolor: "#333333",
        slidebutton_color: "#FFFFFF",
    };
    var cascadeServer = "https://cascade2.libchat.com";
    var referer = "";
    var refererTitle = "";
    var removeCoverageFromRule = function (rule) {
            return { u: rule.u, d: rule.d, c: rule.c, fallbackSeconds: rule.fallbackSeconds || 0 };
        },
        isCoverageInRange = function (hour, minute, ranges) {
            if (0 === ranges.length) return !1;
            for (var i = 0; i <= ranges.length; i++) {
                var range = ranges[i];
                if (Array.isArray(range) && 2 === range.length) {
                    var start = range[0].split(":").map(function (el) {
                            return parseInt(el, 10);
                        }),
                        end = range[1].split(":").map(function (el) {
                            return parseInt(el, 10);
                        });
                    if (!(start[0] > hour || end[0] < hour)) {
                        if (start[0] < hour && end[0] > hour) return !0;
                        if (start[0] !== hour) {
                            if (end[0] === hour && end[1] > minute) return !0;
                        } else if (start[1] < minute) return !0;
                    }
                }
            }
            return !1;
        },
        adjustStatusRequestForCoverage = function (onlineRules) {
            var finalRules = [],
                now = new Date(),
                day = now.getUTCDay(),
                hour = now.getUTCHours(),
                minute = now.getUTCMinutes();
            return (
                onlineRules.forEach(function (rule) {
                    if (rule.c && 1 !== rule.coverageType) {
                        if (0 !== rule.coverageType) {
                            var times = rule.coverageHours;
                            if (times && times[day] && 0 !== times[day].length) {
                                var ranges = times[day];
                                isCoverageInRange(hour, minute, ranges) && finalRules.push(removeCoverageFromRule(rule));
                            }
                        }
                    } else finalRules.push(removeCoverageFromRule(rule));
                }),
                finalRules
            );
        };
    var buttonWidget = {
        config: {},
        online: !1,
        loaded: !1,
        autoload: !1,
        chatContainer: null,
        chatTimer: null,
        modal: null,
        allydialog: null,
        referer: "",
        refererTitle: "",
        deleteAutoPopDeny: function () {
            try {
                localStorage.removeItem("libchat_auto");
            } catch (e) {}
        },
        saveAutoPopDeny: function () {
            var obj = { date: Math.floor(Date.now() / 1e3) };
            try {
                localStorage.setItem("libchat_auto", JSON.stringify(obj));
            } catch (e) {}
        },
        autoPopDenied: function () {
            try {
                var obj = localStorage.getItem("libchat_auto");
                return "" === obj ? !1 : ((obj = JSON.parse(obj)), !(3600 < Math.floor(Date.now() / 1e3) - obj.date) || (this.deleteAutoPopDeny(), !1));
            } catch (e) {
                this.deleteAutoPopDeny();
            }
            return !1;
        },
        openChat: function () {
            "" === this.referer && (this.referer = window.location.href), "" === this.refererTitle && window.document.title && (this.refererTitle = window.document.title);
            var widgetUrl = "https://" + this.config.base_domain + "/chati.php?hash=" + this.config.hash + "&referer=" + encodeURIComponent(this.referer) + "&referer_title=" + encodeURIComponent(this.refererTitle);
            window.open(widgetUrl, "libchat", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=" + this.config.width + ", height=" + this.config.height);
        },
        handleAutoPopAccept: function () {
            this.openChat(), this.allydialog.hide(), this.modal.parentNode.removeChild(this.modal), this.saveAutoPopDeny();
        },
        handleAutoPopDeny: function () {
            this.modal.parentNode.removeChild(this.modal), this.saveAutoPopDeny();
        },
        handleLibCalLink: function () {
            window.open(this.config.cal_url);
        },
        showModal: function () {
            if (((this.autoload = !0), "undefined" != typeof A11yDialog)) {
                (this.modal = document.createElement("div")), (this.modal.id = "libchat_modal_" + this.config.id);
                var overlay = document.createElement("div");
                overlay.setAttribute("tabindex", "-1"), overlay.setAttribute("data-a11y-dialog-hide", "true");
                var dialog = document.createElement("dialog");
                dialog.setAttribute("aria-labelledby", "libchat_modal_title");
                var dialog_title = document.createElement("h1");
                (dialog_title.id = "libchat_modal_title"), dialog_title.setAttribute("tabindex", 0), (dialog_title.innerHTML = this.config.autoload_head);
                var dialog_text = document.createElement("div");
                (dialog_text.id = "autoload_text"), (dialog_text.innerHTML = this.config.autoload_text);
                var dialog_btns = document.createElement("div");
                dialog_btns.id = "autoload_btn";
                var dialog_yes = document.createElement("button");
                dialog_yes.setAttribute("type", "button"), (dialog_yes.innerHTML = this.config.autoload_yes);
                var dialog_cal = null;
                this.config.cal_autoload &&
                    this.config.cal_url &&
                    "" !== this.config.cal_url &&
                    this.config.cal_text &&
                    "" !== this.config.cal_text &&
                    ((dialog_cal = document.createElement("button")).setAttribute("type", "button"), (dialog_cal.innerHTML = this.config.cal_text));
                var dialog_no = document.createElement("button");
                dialog_no.setAttribute("type", "button"),
                    (dialog_no.innerHTML = this.config.autoload_no),
                    dialog_no.setAttribute("data-a11y-dialog-hide", "true"),
                    dialog_btns.appendChild(dialog_yes),
                    null !== dialog_cal && dialog_btns.appendChild(dialog_cal),
                    dialog_btns.appendChild(dialog_no),
                    dialog.appendChild(dialog_title),
                    dialog.appendChild(dialog_text),
                    dialog.appendChild(dialog_btns),
                    this.modal.appendChild(overlay),
                    this.modal.appendChild(dialog),
                    document.body.appendChild(this.modal),
                    (this.allydialog = new A11yDialog(this.modal, this.chatContainer)),
                    dialog_yes.addEventListener("click", this.handleAutoPopAccept.bind(this)),
                    dialog_no.addEventListener("click", this.handleAutoPopDeny.bind(this)),
                    null !== dialog_cal && dialog_cal.addEventListener("click", this.handleLibCalLink.bind(this)),
                    this.allydialog.show();
            }
        },
        setTimer: function (isCoopOnline) {
            if (this.online) {
                if (isCoopOnline) return;
                this.config.autoload_time && 0 < parseInt(this.config.autoload_time, 10) && !this.autoPopDenied() && (this.chatTimer = window.setTimeout(this.showModal.bind(this), 1e3 * parseInt(this.config.autoload_time, 10)));
            } else this.autoload = !1;
        },
        handleOnlineClick: function (ev) {
            ev.preventDefault(), clearTimeout(this.chatTimer), this.online || "" === this.config.offline_url ? this.openChat() : (window.location.href = this.config.offline_url);
        },
        buildButton: function () {
            var img = document.createElement("img");
            img.className = "libchat_btn_img";
            var link = document.createElement("a");
            this.online
                ? "" !== this.config.slidebutton_url
                    ? (img.setAttribute("src", this.config.slidebutton_url), img.setAttribute("alt", this.config.slidebutton_text), link.setAttribute("href", "#"), link.appendChild(img))
                    : (((link = document.createElement("button")).innerHTML = this.config.slidebutton_text), (link.className = "libchat_online"))
                : "" !== this.config.slidebutton_url_off
                ? (img.setAttribute("src", this.config.slidebutton_url_off),
                  img.setAttribute("alt", this.config.slidebutton_text_off),
                  "" !== this.config.offline_url && link.setAttribute("href", this.config.offline_url),
                  link.appendChild(img))
                : (((link = document.createElement("button")).innerHTML = this.config.slidebutton_text_off), (link.className = "libchat_offline")),
                link.addEventListener("click", this.handleOnlineClick.bind(this)),
                this.chatContainer.appendChild(link);
        },
        statusError: function () {
            (this.online = !1), this.buildButton();
        },
        statusSuccess: function (data) {
            (this.online = !1), (data.u || data.d || data.c) && (this.online = !0), this.buildButton();
            var isCoopOnline = !1;
            data.c && 0 < data.c.length && (isCoopOnline = !0), this.setTimer(isCoopOnline);
        },
        statusComplete: function (ev) {
            var xhr = ev.target,
                status = xhr.status;
            if (200 <= status && status < 300)
                try {
                    this.statusSuccess(JSON.parse(xhr.responseText));
                } catch (e) {
                    this.statusError();
                }
            else this.statusError();
        },
        checkStatus: function () {
            var adjustedRules = adjustStatusRequestForCoverage(this.config.onlinerules),
                xhr = new XMLHttpRequest();
            (xhr.onload = this.statusComplete.bind(this)),
                (xhr.onerror = this.statusError.bind(this)),
                xhr.open("GET", this.cascadeServer + "/widget_status?iid=" + this.config.iid + "&rules=" + encodeURIComponent(JSON.stringify(adjustedRules))),
                xhr.send();
        },
        insertWidgetCSS: function () {
            var id = "#" + this.chatContainer.id,
                css =
                    "/* LibChat Widget CSS */ " +
                    id +
                    " img { width: " +
                    this.config.slidebutton_width +
                    "; height: " +
                    this.config.slidebutton_height +
                    "; } " +
                    id +
                    " button { display: inline-block; padding: 6px 12px; margin-bottom: 0; text-align: center; white-space: nowrap; vertical-align: middle; cursor: pointer; background-image: none; border: 1px solid transparent; border-radius: 4px; background-color: " +
                    this.config.slidebutton_bcolor_off +
                    "; color: " +
                    this.config.slidebutton_color_off +
                    "; } " +
                    id +
                    " button.libchat_online { background-color: " +
                    this.config.slidebutton_bcolor +
                    "; color: " +
                    this.config.slidebutton_color +
                    "; }/* overlay for modal */ div[data-a11y-dialog-hide] { position: fixed; background-color: rgb(0, 0, 0); top: 0; left: 0; bottom: 0; right: 0; opacity: 0.3; z-index: 500; }/* modal */ #libchat_modal_" +
                    this.config.id +
                    "{ position: fixed; top: 0; left: 0; bottom: 0; right: 0; font-size: 100%; } #libchat_modal_" +
                    this.config.id +
                    '[aria-hidden="true"] { display: none; }#libchat_modal_' +
                    this.config.id +
                    "[data-a11y-dialog-native] > :first-child { display: none; }#libchat_modal_" +
                    this.config.id +
                    " dialog { position: relative; z-index: 501; margin: 50px auto; width: 300px; background-color: " +
                    this.config.color_backg +
                    "; padding: 1em; border-radius: 5px; }#libchat_modal_" +
                    this.config.id +
                    " dialog[open] { display: block; }/* modal content */ #libchat_modal_" +
                    this.config.id +
                    " h1 { color: " +
                    this.config.color_head +
                    "; font-size: 2em; margin: 0 0 0.5em 0; padding: 0; line-height: 1.2em; } #libchat_modal_" +
                    this.config.id +
                    " button { color: " +
                    this.config.color_btn +
                    "; background-color: " +
                    this.config.color_head +
                    "; margin: 1em 1em 0 0; border: none; border-radius: 5px; padding: 0.5em 1em; font-size: 1em; }",
                head = document.head || document.getElementsByTagName("head")[0],
                style = document.createElement("style");
            (style.type = "text/css"), style.styleSheet ? (style.styleSheet.cssText = css) : style.appendChild(document.createTextNode(css)), head.appendChild(style);
        },
        start: function () {
            !0 !== this.loaded &&
                ((this.loaded = !0), (this.chatContainer = document.querySelector("#libchat_" + this.config.hash + ", #libchat_btn_widget, #libchat_d2o_widget")), null !== this.chatContainer && (this.insertWidgetCSS(), this.checkStatus()));
        },
    };
    (buttonWidget.config = options),
        (buttonWidget.cascadeServer = cascadeServer),
        (buttonWidget.referer = referer),
        (buttonWidget.refererTitle = refererTitle),
        "complete" === document.readyState || "interactive" === document.readyState
            ? buttonWidget.start()
            : (document.addEventListener("DOMContentLoaded", buttonWidget.start.bind(buttonWidget), !1), window.addEventListener("load", buttonWidget.start.bind(buttonWidget), !1));
})();
