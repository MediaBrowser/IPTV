define(['baseView', 'loading', 'emby-input', 'emby-select', 'emby-button', 'emby-checkbox', 'emby-scroller', 'emby-select', 'flexStyles'], function (BaseView, loading) {
    'use strict';

    function View(view, params) {
        BaseView.apply(this, arguments);

        var page = view;
        var instance = this;

        page.querySelector('.btnAdd').addEventListener('click', instance.addStreamPopup.bind(instance));

        page.querySelector('.btnCancel').addEventListener('click', function (e) {

            this.closest('.streamPopup').classList.add('hide');
        });

        page.querySelector('.streamList').addEventListener('click', function (e) {

            var btnDeleteStream = e.target.closest('.btnDeleteStream');
            if (btnDeleteStream) {
                instance.deleteStream(parseInt(btnDeleteStream.getAttribute('data-index')));
            }
        });

        page.querySelector('.streamForm').addEventListener('submit', function (e) {

            e.preventDefault();

            page.querySelector('.streamPopup').classList.add('hide');
            var form = this;

            var newEntry = true;
            var name = page.querySelector('.Name').value;
            var image = page.querySelector('.Image').value;
            var url = page.querySelector('.URL').value;
            var type = page.querySelector('.Type').value;
            var userId = ApiClient.getCurrentUserId();

            if (instance.config.Bookmarks.length > 0) {

                for (var i = 0, length = instance.config.Bookmarks.length; i < length; i++) {
                    if (instance.config.Bookmarks[i].Name === name) {
                        newEntry = false;
                        instance.config.Bookmarks[i].Image = image;
                        instance.config.Bookmarks[i].Path = url;
                        instance.config.Bookmarks[i].Protocol = type;
                        instance.config.Bookmarks[i].UserId = userId;
                    }
                }
            }

            if (newEntry) {

                var conf = {};

                conf.Name = name;
                conf.Image = image;
                conf.Path = url;
                conf.Protocol = type;
                conf.UserId = userId;
                instance.config.Bookmarks.push(conf);

            }
            instance.save();
            instance.populateStreamList();
            return false;
        });
    }

    Object.assign(View.prototype, BaseView.prototype);

    View.prototype.populateStreamList = function () {

        var streams = this.config.Bookmarks;

        var html = "";

        for (var i = 0; i < streams.length; i++) {

            var stream = streams[i];

            html += '<div class="listItem listItem-border">';

            html += '<i class="listItemIcon md-icon">live_tv</i>';

            html += '<div class="listItemBody two-line">';

            html += '<h3 class="listItemBodyText">';
            html += stream.Name;
            html += '</h3>';

            html += '</div>';

            html += '<button type="button" is="paper-icon-button-light" class="btnDeleteStream" data-index="' + i + '" title="Delete"><i class="md-icon">delete</i></button>';
            html += '</div>';
        }

        var streamList = this.view.querySelector('.streamList');
        streamList.innerHTML = html;

        if (streams.length) {
            streamList.classList.remove('hide');
        } else {
            streamList.classList.add('hide');
        }
    };

    View.prototype.deleteStream = function (index) {

        var msg = "Are you sure you wish to delete this bookmark?";
        var instance = this;

        require(['confirm'], function (confirm) {

            confirm(msg, "Delete Bookmark").then(function () {
                instance.config.Bookmarks.splice(index, 1);

                instance.save();
                instance.populateStreamList();
            });
        });
    };

    View.prototype.addStreamPopup = function () {

        var page = this.view;

        page.querySelector('.Name').value = '';
        page.querySelector('.Image').value = '';
        page.querySelector('.URL').value = '';
        page.querySelector('.streamPopup').classList.remove('hide');
        page.querySelector('.Name').focus();
    };

    View.prototype.save = function () {

        var instance = this;

        ApiClient.getPluginConfiguration("c333f63b-83e9-48d2-8b9a-c5aba546fb1e").then(function (config) {

            config.Bookmarks = instance.config.Bookmarks;

            ApiClient.updatePluginConfiguration("c333f63b-83e9-48d2-8b9a-c5aba546fb1e", config).then(Dashboard.processPluginConfigurationUpdateResult);
        });
    };

    View.prototype.onResume = function (options) {

        BaseView.prototype.onResume.apply(this, arguments);

        var instance = this;
        loading.show();

        ApiClient.getPluginConfiguration("c333f63b-83e9-48d2-8b9a-c5aba546fb1e").then(function (config) {

            instance.config = config;

            instance.populateStreamList();
            loading.hide();
        });
    };

    return View;
});
