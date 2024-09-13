// ==UserScript==
// @name         Sync to flomo
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  create a flomo note, need flomo api. based on fankaidev's version
// @author       quantek
// @match        https://xueqiu.com/*
// @match        https://www.4d4y.com/*
// @match        https://*.zhihu.com/*
// @match        https://mp.weixin.qq.com/*
// @match        https://www.jisilu.cn/*
// @connect      flomoapp.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function () {
    "use strict";
    var flomoFullContent = "";
    function createFlomoButton(flomoApi) {
        const img = document.createElement("img");
        img.style.cursor = "pointer";
        img.style.width = "32px";
        img.style.height = "32px";
        img.style.border = "2px solid #30CF79";
        img.style.borderRadius = "8px";
        img.onclick = function () {
            GM_xmlhttpRequest({
                method: "POST",
                url: flomoApi,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ content: flomoFullContent }),
                onload: function (response) {
                    console.log("Success:", response.status);
                },
                onerror: function (response) {
                    console.log("Error:", response.statusText);
                },
            });
            img.style.width = "36px";
            img.style.height = "36px";
            setTimeout(function () {
                img.style.width = "32px";
                img.style.height = "32px";
            }, 200);
        };
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://flomoapp.com/images/logo-192x192.png",
            responseType: "blob",
            onload: function (response) {
                img.src = URL.createObjectURL(response.response);
            },
        });
        const div = document.createElement("div");
        div.appendChild(img);
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.width = "36px";
        div.style = "top:90%;right:50%;position:fixed;"
        document.body.appendChild(div);
        return div;
    }
    function fetchFlomoApi() {
        let flomoApi = GM_getValue("flomo_api");
        if (!flomoApi) {
            flomoApi = prompt("Please enter the flomo_api from https://v.flomoapp.com/mine/?source=incoming_webhook");
            if (flomoApi) {
                GM_setValue("flomo_api", flomoApi);
                alert("flomo_api has been saved.");
            } else {
                alert("No key entered. flomo_api was not saved.");
                return false;
            }
        }
        return flomoApi;
    }
    function processXueqiu() {
        console.log("try Xueqiu process");
        let postDocTitle = document.querySelector('#app > div.container.article__container > article > h1');
        let postTitle = '';
        if (postDocTitle.textContent.length>0) {
            postTitle = postDocTitle.textContent + '\n\r';
        }
        let postDoc = document.querySelector('#app > div.container.article__container > article >div.article__bd__detail');
        let postAuthorLink = postDoc.children[0].textContent;
        postDoc.removeChild(postDoc.children[0]);
        let postContent = postDoc.innerHTML.replace(/<br>/g, "\n\r").replace(/<\/p>/g, "\n\r").replace(/<[^>]*>?/gm, '');
        console.log(postTitle);
        console.log(postAuthorLink);
        console.log(postContent);
        flomoFullContent = '#雪球 ' + postTitle + postContent + '\n\r' + postAuthorLink;
        return true;
    }
    function processSelection() {
        console.log("try selection process");
        let postLink = window.location.href;
        console.log(postLink);
        flomoFullContent = '#选择 '  + '\n\r' + postLink;
        document.addEventListener("selectionchange",event=>{
            let postTitle = document.title;
            let selection = document.getSelection ? document.getSelection().toString() :  document.selection.createRange().toString() ;
            flomoFullContent = '#网站 ' + postTitle +'\n\r'+ selection + '\n\r' + postLink;
        })
        return true;
    }
    function setup(){
        const flomoApi = fetchFlomoApi();
        if (!flomoApi) {
            return true;
        }
        const flomoButton = createFlomoButton(flomoApi);
        var href = window.location.host;
        console.log(href);
        if (href == 'xueqiu.com'){
            processXueqiu();
        }else{
            processSelection();
        }
    }
    setup();
})();
