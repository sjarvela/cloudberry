! function(cloudberry) {
    'use strict';

    /* Platform */
    cloudberry.platform.push({
        setup: function(app, o) {
            app.config(function($provide) {
                $provide.factory('settings', function() {
                    return o.settings;
                });

                $provide.factory('views', function() {
                    return {
                        all: o.views,
                        get: function(parent) {
                            var result = [];
                            $.each(o.views, function(i, v) {
                                if (v.parent == parent) result.push(v);
                            });
                            return result;
                        }
                    };
                });

                $provide.factory('actions', function() {
                    return {
                        getType: function(type) {
                            return o.actions.byType[type];
                        }
                    };
                });

                $provide.factory('configDetails', function() {
                    return {
                        getDetails: function(parent) {
                            if (!o.configDetails[parent]) return [];
                            return o.configDetails[parent];
                        }
                    };
                });
            });

            app.run(['$templateCache',
                function($templateCache) {
                    //popover
                    $templateCache.put("template/popover/popover-template.html",
                        "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
                        "  <div class=\"arrow\"></div>\n" +
                        "  <div class=\"popover-inner\">\n" +
                        "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
                        "      <div class=\"popover-content\"></div>\n" +
                        "  </div>\n" +
                        "</div>\n" +
                        "");

                    // ng-grid footer
                    $templateCache.put('footerTemplate.html',
                        "<div ng-show=\"showFooter\" class=\"ngFooterPanel\" ng-class=\"{'ui-widget-content': jqueryUITheme, 'ui-corner-bottom': jqueryUITheme}\" ng-style=\"footerStyle()\">\r" +
                        "\n" +
                        "    <div class=\"ngTotalSelectContainer\" >\r" +
                        "\n" +
                        "        <div class=\"ngFooterTotalItems\" ng-class=\"{'ngNoMultiSelect': !multiSelect}\" >\r" +
                        "\n" +
                        "            <span class=\"ngLabel\" translate>grid_totalCount {{maxRows()}}</span><span ng-show=\"filterText.length > 0\" class=\"ngLabel\" translate>(grid_filteredCount {{totalFilteredItemsLength()}})</span>\r" +
                        "\n" +
                        "        </div>\r" +
                        "\n" +
                        "    </div>\r" +
                        "\n" +
                        "    <div class=\"ngPagerContainer\" style=\"float: right; margin-top: 10px;\" ng-show=\"enablePaging\" ng-class=\"{'ngNoMultiSelect': !multiSelect}\">\r" +
                        "\n" +
                        "        <div style=\"float:left; margin-right: 10px;\" class=\"ngRowCountPicker\">\r" +
                        "\n" +
                        "            <span style=\"float: left; margin-top: 3px;\" class=\"ngLabel\" translate>grid_pageSize</span>\r" +
                        "\n" +
                        "            <select style=\"float: left;height: 27px; width: 100px\" ng-model=\"pagingOptions.pageSize\" >\r" +
                        "\n" +
                        "                <option ng-repeat=\"size in pagingOptions.pageSizes\">{{size}}</option>\r" +
                        "\n" +
                        "            </select>\r" +
                        "\n" +
                        "        </div>\r" +
                        "\n" +
                        "        <div style=\"float:left; margin-right: 10px; line-height:25px;\" class=\"ngPagerControl\" style=\"float: left; min-width: 135px;\">\r" +
                        "\n" +
                        "            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageToFirst()\" ng-disabled=\"cantPageBackward()\" title=\"{{i18n.ngPagerFirstTitle}}\"><div class=\"ngPagerFirstTriangle\"><div class=\"ngPagerFirstBar\"></div></div></button>\r" +
                        "\n" +
                        "            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageBackward()\" ng-disabled=\"cantPageBackward()\" title=\"{{i18n.ngPagerPrevTitle}}\"><div class=\"ngPagerFirstTriangle ngPagerPrevTriangle\"></div></button>\r" +
                        "\n" +
                        "            <input class=\"ngPagerCurrent\" min=\"1\" max=\"{{currentMaxPages}}\" type=\"number\" style=\"width:50px; height: 24px; margin-top: 1px; padding: 0 4px;\" ng-model=\"pagingOptions.currentPage\"/>\r" +
                        "\n" +
                        "            <span class=\"ngGridMaxPagesNumber\" ng-show=\"maxPages() > 0\">/ {{maxPages()}}</span>\r" +
                        "\n" +
                        "            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageForward()\" ng-disabled=\"cantPageForward()\" title=\"{{i18n.ngPagerNextTitle}}\"><div class=\"ngPagerLastTriangle ngPagerNextTriangle\"></div></button>\r" +
                        "\n" +
                        "            <button type=\"button\" class=\"ngPagerButton\" ng-click=\"pageToLast()\" ng-disabled=\"cantPageToLast()\" title=\"{{i18n.ngPagerLastTitle}}\"><div class=\"ngPagerLastTriangle\"><div class=\"ngPagerLastBar\"></div></div></button>\r" +
                        "\n" +
                        "        </div>\r" +
                        "\n" +
                        "    </div>\r" +
                        "\n" +
                        "</div>\r" +
                        "\n"
                    );

                }
            ]);

            // views
            app.
            config(['$stateProvider', '$urlRouterProvider',
                function($stateProvider, $urlRouterProvider) {
                    // For any unmatched url, redirect to /files
                    //$urlRouterProvider.otherwise("/files");
                    //$urlRouterProvider.otherwise(function($injector, $location) {
                    //    console.log("NOT FOUND: "+$location.$$path);
                    //    return "login";
                    //});

                    var templateUrlFn = function(tpl) {
                        return function(stateParams) {
                            var tplName = angular.isFunction(tpl) ? tpl(stateParams) : tpl;
                            return 'templates/' + tplName; //TODO path from params
                        };
                    };

                    var rd = [];
                    $.each(cloudberry.utils.getKeys(o.views), function(i, vk) {
                        var v = o.views[vk];
                        var vp = {};
                        var subviews = false;
                        if (v.abstract) vp.abstract = true;
                        if (v.url) vp.url = v.url;
                        if (v.parent) vp.parent = v.parent;
                        if (v.resolve) vp.resolve = v.resolve;

                        if (v.subviews) {
                            subviews = {};
                            $.each(cloudberry.utils.getKeys(v.subviews), function(i, svk) {
                                var sv = v.subviews[svk];
                                var svp = {
                                    templateUrl: templateUrlFn(sv.template)
                                };
                                if (sv.controller) {
                                    if (angular.isFunction(sv.controller)) svp.controllerProvider = sv.controller;
                                    else svp.controller = sv.controller;
                                }
                                if (svp.resolve) svp.resolve = sv.resolve;

                                subviews[svk] = svp;
                            });
                            subviews[''] = {
                                controller: v.controller,
                                templateUrl: templateUrlFn(v.template)
                            };
                            vp.views = subviews;
                        } else {
                            if (v.controller) {
                                if (angular.isFunction(v.controller)) vp.controllerProvider = v.controller;
                                else vp.controller = v.controller;
                            }
                            vp.templateUrl = templateUrlFn(v.template);
                        }

                        console.log("VIEW:" + vk);
                        console.log(vp);
                        $stateProvider
                            .state(vk, vp);

                        if (v.redirect) {
                            var fn = false;
                            var deps = false;

                            if (typeof(v.redirect) == 'function') fn = v.redirect;
                            else if (window.isArray(v.redirect) && v.redirect.length > 0) {
                                fn = v.redirect[v.redirect.length - 1];
                                deps = v.redirect.slice(0, v.redirect.length - 1);
                            }

                            if (fn) rd.push({
                                id: vk,
                                fn: fn,
                                deps: deps
                            });
                        }
                    });

                    if (rd.length > 0) $urlRouterProvider.rule(function($injector, $location) {
                        var res = undefined;

                        $.each(rd, function(i, rde) {
                            //TODO matches location?
                            var deps = [];
                            var args = [{
                                location: $location
                            }];
                            if (rde.deps)
                                for (var i = 0; i <= rde.deps.length - 1; i++) args.push($injector.get(rde.deps[i]));
                            res = rde.fn.apply(null, args);
                            if (res) return false;
                        });
                        return res;
                    });
                }
            ]);

            app.factory('dialogs', ['$rootScope', '$modal',
                function($rootScope, $modal) {
                    return {
                        confirmation: function(title, message) {
                            var df = $.Deferred();
                            var modalInstance = $modal.open({
                                templateUrl: 'core/confirmation_dialog.html',
                                controller: function($modalInstance, $scope, spec) {
                                    $scope.spec = spec;

                                    $scope.ok = function() {
                                        $modalInstance.close();
                                    };

                                    $scope.cancel = function() {
                                        $modalInstance.dismiss('cancel');
                                    };
                                },
                                resolve: {
                                    spec: function() {
                                        return {
                                            title: title,
                                            message: message
                                        };
                                    }
                                }
                            });
                            modalInstance.result.then(df.resolve);
                            return df.promise();
                        },
                        custom: function(id) {
                            var df = $.Deferred();
                            var d = o.dialogs[id];
                            if (!d) return;

                            var resolve = {};
                            if (d.params) {
                                var args = arguments;
                                $.each(d.params, function(i, p) {
                                    if (args.length <= i + 1) return false;
                                    var a = args[i + 1];
                                    if (typeof(a) == 'function') resolve[p] = a;
                                    else
                                        resolve[p] = (function(v) {
                                            return function() {
                                                return v;
                                            }
                                        })(a);
                                })
                            }

                            var modalInstance = $modal.open({
                                templateUrl: d.template, //TODO path
                                controller: d.controller,
                                resolve: resolve
                            });
                            modalInstance.result.then(function(r) {
                                df.resolve(r);
                            }, df.reject);
                            return df.promise();
                        }
                    }
                }
            ]);

            app.directive('ngRightClick', function($parse) {
                return function(scope, element, attrs) {
                    var fn = $parse(attrs.ngRightClick);
                    element.bind('contextmenu', function(event) {
                        scope.$apply(function() {
                            event.preventDefault();
                            fn(scope, {
                                $event: event
                            });
                        });
                    });
                };
            });

            app.directive('menuList', function() {
                return {
                    template: '<ul class="dropdown-menu" role="menu"><menu-item ng-repeat="item in items"></menu-item></ul>',
                    replace: true,
                    transclude: true,
                    restrict: 'E',
                    scope: {
                        items: '=ngItems',
                        ctx: '=ngCtx'
                    }
                };
            });

            app.directive('menuItem', function($rootScope, $compile) {
                return {
                    restrict: 'E',
                    replace: true,
                    transclude: true,
                    template: '<li>' + '<a href="#" ng-click="onItem(item)">' + '<i class="fa {{item.icon}}"></i>&nbsp;' + '{{item.titleKey | translate}}' + '</a>' + '</li>',
                    link: function(scope, elm, attrs) {
                        scope.onItem = function(item) {
                            $rootScope.onAction(item, scope.ctx);
                        };
                        /*if (scope.item.children && scope.item.children.length > 0) {
                        var subItems = $compile('<menu-list ng-model="item.children"></menu-list>')(scope)
                        elm.append(subItems);
                    }*/
                    }
                };
            });

            var _dragObj = false;

            app.directive('draggable', ['$parse',
                function($parse) {
                    return {
                        restrict: 'A',
                        compile: function($element, attr) {
                            var onDragStart = $parse(attr['draggable']);

                            return function(scope, element, attr) {
                                var domElement = element[0];

                                domElement.draggable = true;
                                domElement.addEventListener('dragstart', function(e) {
                                    var dragObj = false;
                                    _dragObj = false;

                                    e.dataTransfer.effectAllowed = "none";
                                    if (!onDragStart) return false;

                                    scope.$apply(function() {
                                        dragObj = onDragStart(scope, {
                                            $event: e
                                        });
                                    });
                                    if (!dragObj) return false;

                                    var dragImageType = dragObj.type;
                                    if (dragObj.type == 'filesystemitem') {
                                        var pl = dragObj.payload;
                                        if (!window.isArray(pl) || pl.length == 1) {
                                            var item = window.isArray(pl) ? pl[0] : pl;

                                            if (!item.is_file) dragImageType = "filesystemitem-folder";
                                            else dragImageType = "filesystemitem-file";
                                        } else {
                                            dragImageType = "filesystemitem-many";
                                        }
                                        //TODO api.enableDragToDesktop(pl, e);
                                    }
                                    var $e = $(this);
                                    $e.addClass("dragged");
                                    e.dataTransfer.effectAllowed = "copyMove";

                                    console.log("DRAG START " + dragObj.type);
                                    _dragObj = {
                                        obj: dragObj,
                                        $e: $e
                                    };

                                    if (o.settings.dnd.dragimages[dragImageType]) {
                                        var img = document.createElement("img");
                                        img.src = o.settings.dnd.dragimages[dragImageType];
                                        e.dataTransfer.setDragImage(img, 0, 0);
                                    }
                                    return;
                                });
                            };
                        }
                    };
                }
            ]);

            app.directive('droppable', ['$parse',
                function($parse) {
                    return {
                        restrict: 'A',
                        compile: function($element, attr) {
                            var onDrop = $parse(attr['droppable']);
                            var canDrop = $parse(attr['candrop']);
                            var dropAcceptType = attr['dropaccepttype'];

                            return function(scope, element, attr) {
                                var domElement = element[0];

                                domElement.droppable = true;
                                domElement.addEventListener('drop', function(e) {
                                    if (e.stopPropagation) e.stopPropagation();
                                    if (!_dragObj || _dragObj.$e[0] === this) return;
                                    if (dropAcceptType && dropAcceptType != _dragObj.obj.type) return;

                                    scope.$apply(function() {
                                        onDrop(scope, {
                                            dragObj: _dragObj.obj.payload,
                                            dragType: _dragObj.obj.type,
                                            $event: e
                                        });
                                    });
                                    $(this).removeClass("dragover");
                                    _dragObj = false;
                                });
                                domElement.addEventListener('dragenter', function(e) {
                                    if (!_dragObj || _dragObj.$e[0] === this) return false;
                                    if (dropAcceptType && dropAcceptType != _dragObj.obj.type) return;

                                    var dropSpec = false;
                                    scope.$apply(function() {
                                        dropSpec = canDrop(scope, {
                                            dragObj: _dragObj.obj.payload,
                                            dragType: _dragObj.type,
                                            $event: e
                                        });
                                    });
                                    if (!dropSpec) return false;
                                    $(this).addClass("dragover");
                                });
                                domElement.addEventListener('dragover', function(e) {
                                    if (!_dragObj || _dragObj.$e[0] === this) return false;
                                    if (dropAcceptType && dropAcceptType != _dragObj.obj.type) return;
                                    if (e.preventDefault) e.preventDefault();

                                    var fx = "none";
                                    var dropSpec = false;

                                    scope.$apply(function() {
                                        dropSpec = canDrop(scope, {
                                            dragObj: _dragObj.obj.payload,
                                            dragType: _dragObj.type,
                                            $event: e
                                        });
                                    });
                                    if (!dropSpec) return false;
                                    if (dropSpec === true) fx = (dropSpec === true) ? "copy" : dropSpec;

                                    e.dataTransfer.dropEffect = fx;
                                    return false;
                                });
                                domElement.addEventListener('dragleave', function(e) {
                                    $(this).removeClass("dragover");
                                });
                            };
                        }
                    };
                }
            ]);
        }
    });
}(window.cloudberry);
