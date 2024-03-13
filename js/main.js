var is_head_added = false,
    is_black_colred = false,
    is_custom_css = false,
    head = document.documentElement || document.head || document.querySelector("head");
var document_observer = new MutationObserver(function (mutations) {
    if (document.head && is_head_added === false) {
        dark_mode_main.append_css_element();
        is_head_added = true;
    }
    if (document.body) {
        dark_mode_main.remove_link_element();
        document.body.style.setProperty('background', 'white', 'important');
        document_observer.disconnect();
    }
});
var document_body_observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
        if (records[i].type == "childList") {
            for (var j = 0; j < records[i].addedNodes.length; j++) {
                dark_mode_main.iterate_nodes(records[i].addedNodes[j]);
            }
        }
    }
});
var document_attr_observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
        dark_mode_main.process_node(records[i].target);
    }
});
var dark_mode_main = {
    /**
     * Initialize colors
     */
    blank_color: 'rgba(0, 0, 0, 0)',
    /**
     * Initialize Color Object Varialbe
     */
    curr_obj: {
        'rgb(255, 255, 255)': 'rgb(23, 23, 23)',
        'rgb(245, 245, 245)': 'rgb(22, 22, 22)'
    },
    current_dfc: document.defaultView,
    /**
     * Array reduce method
     * to get sum of values
     */
    get_sum: function (total, num) {
        return parseInt(total) + parseInt(num);
    },
    /**
     * Get sum of rgb values
     * @param {string} color . The color in rgb format
     *
     * @return {int} Returns the sum of rgb value as integer
     */
    get_rgb_data: function (color) {
        var rgb = color.match(/\d+/g);
        return {
            'sum': rgb.reduce(this.get_sum),
            'value': rgb
        }
    },
    /**
     * Blend black color
     * @param {string} c1 . The orginal color
     * @param {int} p . Percent. Lower the number, darker the color would be returend
     *
     * @return {string} Returns darked rgb color
     */
    get_darker_shade: function (c1, p) {
        var new_R = Math.round((parseInt(c1[0]) * p)),
            new_G = Math.round((parseInt(c1[1]) * p)),
            new_B = Math.round((parseInt(c1[2]) * p));
        return "rgb(" + new_R + "," + new_G + "," + new_B + ")";
    },
    /**
     * Custom List for calling custom css
     * @type Object list
     */
    /**
     * Add Link Element to head
     * @param {string} c_path Custom css path
     *
     * @return void
     */
    add_link_element: function (c_path) {
        var link = document.createElement("link"),
            href = chrome.runtime.getURL('css/' + c_path + '.css');
        link.setAttribute("type", "text/css");
        link.setAttribute("id", c_path + '-custom-css');
        link.setAttribute("class", 'dmn-custom-append-data');
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", href);
        if (head) {
            head.appendChild(link);
        }
    },
    /**
     * Custom css hostname and css name
     * object list
     * @version 1.0
     */
    cs: {
        'wikipedia': 'wikipedia',
        'facebook': 'facebook',
        'messenger': 'facebook',
        'amazon': 'amazon',
        'news.google.com': 'NewsGoogle',
        'www.twitch.tv': 'twitchTV',
        'twitter.com': 'twitter',
        'github.com': 'github',
        'accounts.google.com': 'InboxGoogle',
        'inbox.google.com': 'InboxGoogle',
        'www.quora.com': 'quora',
        'www.youtube.com': 'youtube',
        'mail.google.com': 'gmail',
        'web.whatsapp.com': 'WebWhatsapp',
        'darknightmode.com': 'darknightmode'
    },
    /**
     * Runs custom css check
     * If site is in list, it appends desired site list
     *
     * @return void
     */
    run_custom_css_check: function () {
        var site_name = window.location.hostname,
            current_url = false,
            cs = this.cs;
        if (site_name in cs) {
            current_url = cs[site_name];
        } else {
            for (var sname in cs) {
                if (site_name.indexOf(sname) !== -1) {
                    current_url = cs[sname];
                }
            }
        }
        if (current_url) {
            is_custom_css = true;
            this.add_link_element(current_url);
        }
    },
    /**
     * Check if site has custom stylesheet
     *
     * @return {bool} Returns true if custom stylesheet exists
     */
    is_custom_style_site: function () {
        var site_name = window.location.hostname,
            current_url = false,
            cs = this.cs;
        if (site_name in cs) {
            current_url = cs[site_name];
        } else {
            for (var sname in cs) {
                if (site_name.indexOf(sname) !== -1) {
                    current_url = cs[sname];
                }
            }
        }
        return current_url;
    },
    /**
     * Appends css element in head of the body
     * Runs once head is available
     *
     * @ret
     */
    append_css_element: function () {
        this.run_custom_css_check();
        if (is_custom_css === true) {
            return;
        }
        var link = document.createElement("link"),
            href = chrome.runtime.getURL('css/global-new.css');
        link.setAttribute("type", "text/css");
        link.setAttribute("id", "dma-temp-global-css");
        link.setAttribute("class", "dmn-custom-append-data");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", href);
        //Style Attribute
        var style = document.createElement('style'),
            css = '';
        style.type = 'text/css';
        style.setAttribute("id", "dma-temp-global-style");
        style.setAttribute("class", "dmn-custom-remove-after-load");
        style.appendChild(document.createTextNode(css));
        if (head) {
            head.appendChild(link);
            head.appendChild(style);
        }
    },
    remove_css_properties: function () {
        document.body.classList.remove('dma-document-is-in-dark-mode');
        var styles = document.getElementsByClassName('dmn-custom-append-data'),
            style = '';
        if (styles) {
            for (var i = 0; i < styles.length; i++) {
                style = styles[i];
                style.parentNode.removeChild(style);
            }
        }
        var div = document.getElementById('dma-global-overlay-id');
        if (div) {
            div.parentNode.removeChild(div);
        }
    },
    /**
     * Remove global object when needed
     *
     *
     *
     */
    remove_link_object: function () {
        var link = document.getElementById('dma-temp-global-css');
        if (link) {
            link.parentNode.removeChild(link);
        }
    },
    /**
     * Remove link element
     * This removes global css element
     *
     * @return void
     */
    remove_link_element: function () {
        var styles = document.getElementsByClassName('dmn-custom-remove-after-load');
        if (styles) {
            while (styles.length > 0) {
                styles[0].parentNode.removeChild(styles[0]);
            }
            if (is_black_colred === true) {
                document.documentElement.style.removeProperty('background-color');
            }
        }
    },
    /**
     * Get website name
     * @param {string} url The url of website
     *
     * @return {string} Returns hostname from url
     */
    get_hostname: function (url) {
        url = url.replace("www.", '');
        var s = url.indexOf("//") + 2;
        if (s > 1) {
            var o = url.indexOf('/', s);
            if (o > 0) {
                return url.substring(s, o);
            } else {
                o = url.indexOf('?', s);
                if (o > 0) {
                    return url.substring(s, o);
                } else {
                    return url.substring(s);
                }
            }
        } else {
            return url;
        }
    },
    /**
     * Update document if it is already loded
     *
     * @return void
     */
    update_loaded_document: function () {
        if (!dmn_is_processed()) {
            document.body.classList.add("bettertahvel");
            this.append_css_element();
            if (is_custom_css === false) {
                this.update_document();
                dark_mode_main.remove_link_element();
                dark_mode_main.start_observing();
            }
        }
    },
    /**
     * Get hostname from url
     * @param {string} url Url to get hostname of
     *
     * @return {string} returns hostname after extraction
     */
    hostname: function (url) {
        url = url.replace("www.", '');
        var s = url.indexOf("//") + 2;
        if (s > 1) {
            var o = url.indexOf('/', s);
            if (o > 0) {
                return url.substring(s, o);
            } else {
                o = url.indexOf('?', s);
                if (o > 0) {
                    return url.substring(s, o);
                } else {
                    return url.substring(s);
                }
            }
        } else {
            return url;
        }
    },
    /**
     * Process a single node and add the required bg color
     * @param {object} current_node The object to process
     *
     * @return void
     */
    process_node: function (current_node) {
        if ('is_dnm_processed' in current_node && current_node.is_dnm_processed === true) {
            return;
        }
        current_color = this.current_dfc.getComputedStyle(current_node, null).backgroundColor;
        if (current_color && current_color != this.blank_color) {
            if (!(current_color in this.curr_obj)) {
                data = this.get_rgb_data(current_color);
                sum_color = data.sum;
                if (sum_color >= '740' && sum_color <= '765') {
                    curr_opacity = 0.09;
                } else if (sum_color >= '710' && sum_color < '740') {
                    curr_opacity = 0.18;
                } else if (sum_color >= '680' && sum_color < '710') {
                    curr_opacity = 0.24;
                } else if (sum_color >= '580' && sum_color < '680') {
                    curr_opacity = 0.28;
                } else if (sum_color >= '500' && sum_color < '580') {
                    curr_opacity = 0.35;
                } else if (sum_color >= '400' && sum_color < '500') {
                    curr_opacity = 0.45;
                } else if (sum_color >= '300' && sum_color < '400') {
                    curr_opacity = 0.60;
                } else if (sum_color >= '200' && sum_color < '300') {
                    curr_opacity = 0.75;
                } else if (sum_color >= '80' && sum_color < '200') {
                    curr_opacity = 0.90;
                } else if (sum_color < '80') {
                    curr_opacity = 1;
                }
                var bgcolor = this.get_darker_shade(data.value, curr_opacity);
                this.curr_obj[current_color] = bgcolor;
            } else {
                var bgcolor = this.curr_obj[current_color];
            }
            current_node.style.setProperty('background', bgcolor, 'important');
            current_node.is_dnm_processed = true;
        }
    },
    /**
     * Process a all nodes
     * @param {object} nodes The object to process
     *
     * @return void
     */
    process_nodes: function (nodes) {

    },
    /**
     * Check if node is valid node
     * @param {string} name . Check if node is valid node
     *
     * @return void
     */
    is_valid_node: function (name) {
        if (!name) {
            return false;
        }
        if (name == 'SCRIPT' || name == 'STYLE' || name == 'LINK') {
            return false;
        }
        return true;
    },

    /**
     * Start Observation for mutation
     *
     * @return void
     */
    start_observing: function () {
        document_body_observer.observe(document, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    },
    /**
     * Start Attribute Observing
     *
     * @return void
     */
    start_attr_observing: function () {
        document_attr_observer.observe(document, {
            attributes: true,
            subtree: true,
            attributeFilter: ['class']
        });
    },
    /**
     * Update document with colors and data
     * @param {object} nodes . Defaults to body notes if null
     *
     * @return void
     */
    update_document: function (nodes) {
        if (!nodes) {
            nodes = document.body.getElementsByTagName("*");
        }
        var current_color = '',
            data = '',
            sum_color = '',
            curr_opacity = '',
            current_node = '';
        for (var i = 0; i < nodes.length; i++) {
            current_node = nodes[i];
            if (current_node.is_dnm_processed == true) {
                continue;
            }
            current_color = this.current_dfc.getComputedStyle(current_node, null).backgroundColor;
            if (current_color != this.blank_color) {
                if (!(current_color in this.curr_obj)) {
                    data = this.get_rgb_data(current_color);
                    sum_color = data.sum;
                    if (sum_color >= '740' && sum_color <= '765') {
                        curr_opacity = 0.09;
                    } else if (sum_color >= '710' && sum_color < '740') {
                        curr_opacity = 0.18;
                    } else if (sum_color >= '680' && sum_color < '710') {
                        curr_opacity = 0.24;
                    } else if (sum_color >= '580' && sum_color < '680') {
                        curr_opacity = 0.28;
                    } else if (sum_color >= '500' && sum_color < '580') {
                        curr_opacity = 0.35;
                    } else if (sum_color >= '400' && sum_color < '500') {
                        curr_opacity = 0.45;
                    } else if (sum_color >= '300' && sum_color < '400') {
                        curr_opacity = 0.60;
                    } else if (sum_color >= '200' && sum_color < '300') {
                        curr_opacity = 0.75;
                    } else if (sum_color >= '80' && sum_color < '200') {
                        curr_opacity = 0.90;
                    } else if (sum_color < '80') {
                        curr_opacity = 1;
                    }
                    var bgcolor = this.get_darker_shade(data.value, curr_opacity);
                    this.curr_obj[current_color] = bgcolor;
                } else {
                    var bgcolor = this.curr_obj[current_color];
                }
                current_node.style.setProperty('background', bgcolor, 'important');
            }
            //current_node.style.setProperty('color', 'rgb(183, 183, 183)', 'important');
        }
        dark_mode_main.start_attr_observing();
        /*if (current_node.classList.indexOf('l-main-content') > -1) {
            debugger;
        }*/
    },
    /**
     * Remove properties of color and bg from page
     * @param {bool} lock_brg . Wheter to preserver brightness
     *
     * @return void
     */
    normalize_document: function (lock_brg) {
        if (lock_brg == 'off') {
            document.body.style.removeProperty('filter');
            //debugger;
        }
        document_body_observer.disconnect();
        document_attr_observer.disconnect();
        this.remove_css_properties();
        this.remove_link_object();
        document.body.style.removeProperty('background');
        nodes = document.body.getElementsByTagName("*");
        var current_node = '';
        for (var i = 0; i < nodes.length; i++) {
            current_node = nodes[i];
            current_node.style.removeProperty('background');
            current_node.is_dnm_processed = false;
        }
    }
}
chrome.storage.onChanged.addListener(dark_mode_main.trigger_status_change);


/**
 * Check if sheet already processed for dark mode
 *
 * @return {boolean} . Returns true if already processed
 */
function dmn_is_processed() {
    return document.body.className.match('dma-document-is-in-dark-mode');
}



document.addEventListener("DOMContentLoaded", function () {
    setInterval(() => {
        var elements = document.querySelectorAll('.layout-align-start-center.layout-row .bold');

        elements.forEach(function (element) {
            var content = element.textContent.trim();

            if (content === '2' || content === 'X' || content === '1' || content === '?' || content === '0') {
                element.style.color = 'red';
                element.style.fontSize = 'large'
            }
        });
    }, 1000)

});