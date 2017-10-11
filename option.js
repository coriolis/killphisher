const defaultImages = ["kp1.gif", "kp2.jpg", "kp3.jpg", "kp4.jpg"];
var bkg = chrome.extension.getBackgroundPage();

function templateImage(src, favorite, imageClass) {
    const temp = `
    <div class="mdl-cell mdl-cell--4-col mdl-card set-image ${imageClass === undefined ? "" :  imageClass }">
      <div class="mdl-card__media ">
          <img class="secure-image" src="${src}" border="0" alt="">
      </div>
      <div class="mdl-card__menu">
          <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect mdl-button--accent">
            <i class="material-icons kp-active-icons">${favorite}</i>
          </button>
      </div>
    </div>
  `;
    return temp;
}

function templateSafeDomain(data) {
    const template = `
        <li class="mdl-list__item kp-safelist-row" data-name=${data.site}>
            <span class="mdl-list__item-primary-content">
                <i class="material-icons  mdl-list__item-avatar">public</i>
                ${data.site}
            </span>
            <button class="mdl-button mdl-button-icon mdl-js-button mdl-js-ripple-effect mdl-button--colored" ${data.protected? "disabled" :""}>
            <i class="material-icons ${data.protected? "" : "kp-sl-delete"}">delete</i>
            </button>

        </li>
        `;
    return template;
}

//   <a class="mdl-list__item-secondary-action" href="#"><i class="material-icons kp-sl-delete">delete</i></a>
function templateWhitelist(data) {
    const checked = "check_box", unchecked ="check_box_outline_blank";
    let template_str = "";
    if (data.templates) {
        template_str = data.templates.filter(x => !x.deleted).reduce((a,b) => {
            var logo_name = "";
            if (b.name) {
                logo_name = b.name;
            }
            var tmp = `
                <div class="mdl-cell mdl-cell--6-col mdl-card kp-template-card">
                    <div class="mdl-card__media">
                        <img class="template-image" src="${b.base64}" border="0" alt="">
                    </div>
                    <div class="mdl-card__supporting-text">
                    ${logo_name}
                    </div>
                </div>`;
            return a + tmp;
        }, "");
    }

    let protected_urls = "";
    let enabled = data.disabled ? unchecked : checked;
    let disable_flag = data.disabled ?  "disabled" : "";

    if (data.protected) {
        let protectedList = data.protected.filter(x => !x.deleted);
        console.log("Protected List : ", protectedList);
        if (protectedList.length === 1) {
            protected_urls =`
                <tr class="kp-wl-url-row" data-name=${data.name}>
                    <td class="mdl-data-table__cell--non-numeric kp-login-url">${protectedList[0].url}</td>
                </tr>`;
        } else {
            protected_urls = protectedList.reduce((a,b) => {
                let url_disabled = b.disabled? unchecked : checked;
                var tmp = `
                    <tr class="kp-wl-url-row" data-name=${data.name} data-url=${b.url} >
                        <td class="mdl-data-table__cell--non-numeric kp-login-url">${b.url}</td>
                        <td>
                            <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect mdl-button--colored kp-wl-url-check" ${disable_flag}>
                              <i class="material-icons ${data.disabled? "" : "kp-wl-url-check"}">${url_disabled}</i>
                            </button>
                        </td>
                        <td>
                            <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect mdl-button--colored kp-wl-url-delete" ${disable_flag}>
                                <i class="material-icons ${data.disabled? "" : "kp-wl-url-delete"}">delete</i>
                            </button>
                        </td>
                    </tr>`;
                return a + tmp;
            },"");
        }
    }

    const site = `
            <div class="mdl-cell mdl-cell--6-col mdl-card mdl-shadow--4dp kp-wl-site" data-name=${data.name}>
                <div class="mdl-card__title mdl-card--border">
                    <h2 class="mdl-card__title-text">${data.name}</h2>
                </div>
                <div class="mdl-card__menu">
                    <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect mdl-button--colored kp-wl-site-check">
                      <i class="material-icons kp-wl-site-check">${enabled}</i>
                    </button>
                    <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect mdl-button--colored kp-wl-site-delete">
                      <i class="material-icons kp-wl-site-delete">delete</i>
                    </button>
                 </div>
                <div class="mdl-grid kp-template-container">
                ${template_str}
                </div>
                <div class="mdl-cell mdl-cell--12-col kp-url-table-container">
                    <table class="mdl-data-table mdl-js-data-table kp-url-table">
                        <tbody>
                        ${protected_urls}
                        </tbody>
                    </table>
                </div>
            </div>
            `;
    return site;
}

function updateImage(data) {
    if (data) {
        chrome.storage.local.set({ "secure_img": data }, function() {
            console.log("Data Saved : ", data);
            $("#secureimage").attr("src", data.src);
        });
        // For Selected Image
    } else {
        chrome.storage.local.get("secure_img", function(result) {
            data = result.secure_img;
            $("#secureimage").attr("src", data.src);
            if (data.type === "custom"){
                $("#imagegallery #customimage").attr("src", data.src);
                $("#imagegallery #kp-custom-icons").text("favorite");
                $("#imageUpload").text("Change Image");
            } else if (data.type === "suggested" || data.type === "default" ){
                let p = "img[src$='" + data.src.split("assets/")[1] + "']:last";
                $(p).closest(".set-image").find(".kp-active-icons").text("favorite");
            }
        });
    }
}

function renderProtectedList() {
    let data = bkg.getProtectedSitesData();
    $(".kp-wl-site").remove();
    console.log("IDB-data", data);
    data.forEach((x) => {
        $(".kp-wl-main").append(templateWhitelist(x));
    });
    $(".kp-wl-site").on("click", function(e) {
        var name = $(this).data("name");
        if ($(e.target).is(".kp-wl-site-delete")) {
            var res = confirm("Do you want to delete " + name + " from the list of protected pages?");
            if (res) {
                bkg.removeSiteByName(name);
                $(this).remove();
            }
        } else if ($(e.target).is(".kp-wl-site-check")) {
            const checked = "check_box", unchecked ="check_box_outline_blank";
            var icon = $(e.target)[0].getElementsByTagName("i").length > 0 ? $(e.target)[0].getElementsByTagName("i")[0] : $(e.target)[0];
            var value = icon.innerHTML.trim();
            if (value === checked) {
                bkg.toggleSite(name, false);
                icon.innerHTML = unchecked;
            } else {
                bkg.toggleSite(name, true);
                icon.innerHTML = checked;
            }
        }
    });
    $(".kp-wl-url-row").on("click", function(e){
        e.stopPropagation();
        if ($(e.target).is(".kp-wl-url-delete")) {
            let url = $(this).data("url");
            bkg.removeFromProtectedList(url);
            $(this).remove();
        }
        if ($(e.target).is(".kp-wl-url-check")) {
            let url = $(this).data("url");
            const checked = "check_box", unchecked ="check_box_outline_blank";
            let icon = $(e.target)[0].getElementsByTagName("i").length > 0 ? $(e.target)[0].getElementsByTagName("i")[0] : $(e.target)[0];
            let value = icon.innerHTML.trim();
            if (value === checked) {
                bkg.toggleProtectedUrl(url, false);
                icon.innerHTML = unchecked;
            } else {
                bkg.toggleProtectedUrl(url, true);
                icon.innerHTML = checked;
            }
        }
    });
}

function renderSafeDomainTable() {
    $(".kp-safelist").empty();
    let safeSites = bkg.getSafeDomainsData();

    safeSites.forEach((x, index)=> {
        let data = {};
        data.site = x.name;
        data.safe = x.safe; // Needed if we plan to expand the list of safe sites.
        if (x.protected && x.protected.length > 0) {
            data.protected = true;
        } else {
            data.protected = false;
        }
        $(".kp-safelist").append(templateSafeDomain(data));
    });

    $(".kp-safelist-row").on("click", function(e) {
        //e.preventDefault();
        if ($(e.target).is(".kp-sl-delete")) {
            var domain = $(this).data("name");
            var res = confirm("Do you want to delete " + domain + " from the list of safe domains?");
            if (res) {
                bkg.removeFromSafeDomainsBySiteName(domain);
                $(this).remove();
            }
        }
    });
}

function initAdvanceTab() {
    if (bkg.getDebugFlag()) {
        $("#kp-debug-switch").click();
    }
}

$(document).ready(function() {
    $(".mdl-layout__tab").on("click", function(e){
        let href = $(this).attr("href");
        if (href === "#scroll-tab-safedomain") {
            renderSafeDomainTable();
        } else if (href === "#scroll-tab-whitelist") {
            //bkg.syncWhiteList(renderWhitelistTable);
            renderProtectedList();
        }
    });

    let params = getUrlVars();
    console.log(params);
    if (params["tab"] === "safedomain") {
        $("#safedomain")[0].click();
        if (params["host"]) {
            $("label[for=kp-safelist-input]").attr("style", "visibility: hidden");
            $("#kp-safelist-input").focus();
            $("#kp-safelist-input").val(params["host"]);
        }
    }

    initAdvanceTab();
    updateImage();
    defaultImages.forEach(function(img) {
        let imagePath = "assets/img/secure_img/" + img;
        $("#imagegallery .mdl-cell:last").before(templateImage(imagePath, "favorite_border"));
    });

    $(".set-image").on("click", function(event) {
        event.preventDefault();
        var data = {};
        data.type = "suggested";
        var img = $(this).find("img")[0];
        data.src = img.src;
        updateImage(data);

        $(".kp-active-icons").text("favorite_border");
        var icon = $(this).find("i")[0];
        $(icon).text("favorite");
    });

    $(".kp-custom-icons").on("click", function(event) {
        event.preventDefault();
        var data = {};
        data.type = "custom";
        data.src = $("#customimage").attr("src");
        updateImage(data);
        $(".kp-active-icons").text("favorite_border");
        $("#kp-custom-icons").text("favorite");
    });

    $(".img-edit").on("click", function(e) {
        $(".whitelist-container").addClass("hide");
        $(".img-uploader-container").removeClass("hide");
    });

    $("#imageUpload").on("click", function(e) {
        $("#custom-img").click();
    });

    $("#custom-img").change(function(e) {

        var file = e.target.files[0];
        if (!file.type.startsWith("image")) {
            alert("You have uploaded a file of type : " + file.type + ".\n Please upload a valid image file.");
            return;
        }
        if (file.size > 2097154) {
            alert("The image size should not be more than 2MB");
            return;
        }
        var reader = new FileReader();
        reader.onloadend = function() {
            var data = {};
            data.type = "custom";
            data.src = reader.result;
            updateImage(data);
            // $("#imagegallery .cutsom-image").remove();
            $("#imagegallery #customimage").attr("src", reader.result);
            $(".kp-active-icons").text("favorite_border");
            $("#imagegallery #kp-custom-icons").text("favorite");
            // $("#imagegallery .mdl-cell:last").before(templateImage(reader.result, "favorite", "cutsom-image"));
            $("#imageUpload").text("Change Image");
        };
        reader.readAsDataURL(file);

    });

    $("#kp-restore-factory").on("click", function(e) {
        if (confirm("This will delete all personal images, protected pages and image snippets  added by you. Restore factory defaults?")) {
            bkg.cleanDB();
            bkg.setDefaultSecurityImage(function () {
                $("#imagegallery .cutsom-image").remove();
                $("#imagegallery #customimage").attr("src", "");
                $("#imagegallery #kp-custom-icons").text("");
                $("#imageUpload").text("Upload New Image");
                updateImage();
            });
        }
    });

    $(".kp-safelist-add-btn").on("click", function(e) {
        var input = $("#kp-safelist-input").val().trim();
        var val;
        if (input.length > 0) {
            let urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/;
            let continousString = /^\S*$/;
            if (urlPattern.test(input)) {
                val = bkg.getPathInfo(input).host;
            } else if (continousString.test(input)) {
                val = input;
            } else {
                alert("Incorrect domain entered, please try again");
                return;
            }
            let err = bkg.addToSafeDomains(val);
            if (err) {
                alert(err);
            } else {
                renderSafeDomainTable();
            }
        }
        $("#kp-safelist-input").val("");

    });
    $("#kp-debug-switch").on("click", function(e) {
        var val = $(this).is(":checked");
        if (val) {
            bkg.setDebugFlag(true);
        } else {
            bkg.setDebugFlag(false);
        }
    });
});
