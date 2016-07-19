﻿/* 
Copyright 2016 Dicky Suryadi

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

// Support using RequireJS that loads our app.js, or being placed in <script> tag.
(function (factory) {
   if (typeof define === "function" && define["amd"]) {
      define(['jquery', 'knockout', 'dotnetify'], factory);
   }
   else {
      factory(jQuery, ko, binder);
   }
}
(function ($, ko, dotnetify) {

   // Add extension for binding to Google polymer elements.
   dotnetify.binder.extensions["polymer-paper"] =
      {
         version: "1.0.5",

         // Called by dotNetify before binding is applied.
         setBindings: function (elem, bind) {
            var vm = this;
            var id = elem.id;

            if (!vm.$binder.bindable(id))
               return bind;

            bind += bind.length > 0 ? ", " : "";

            var tagName = elem.tagName.toLowerCase();
            if (tagName == "paper-button" || tagName == "paper-icon-button" || tagName == "paper-fab") {
               bind += "vmCommand: " + id;
               vm[id].$bound = true;
            }
            else if (tagName == "paper-badge") {
               bind += "attr: { label: " + id + "}";
               vm[id].$bound = true;
            }
            else if (tagName == "paper-checkbox") {
               bind += "attr: { checked: " + id + " }";
               $(elem).on("change", function () { vm[id](!vm[id]()) });
               vm[id].$bound = true;
            }
            else if (tagName == "paper-dropdown-menu") {
               var propOptions = id + "_options";
               var propCaption = id + "_optionsCaption";
               var propText = id + "_optionsText";
               var propValue = id + "_optionsValue";

               if (vm.hasOwnProperty(propCaption)) {
                  bind += "attr: { label: " + propCaption + " }";
                  vm[propCaption].$bound = true;
               }

               var listbox = $(elem).find("paper-listbox");
               if (listbox.length > 0 && vm.hasOwnProperty(propOptions) && vm.hasOwnProperty(propValue)) {

                  // Add a function that returns the list index of the selected item.
                  vm[id].$selected = function (value) {
                     var key = vm[propValue]();
                     if (typeof value === "undefined") {
                        var match = ko.utils.arrayFirst(vm[propOptions](), function (i) { return typeof i[key] === "function" && i[key]() == vm[id]() });
                        return match != null ? vm[propOptions]().indexOf(match) : null;
                     }
                     else if (typeof vm[propOptions]()[value][key] === "function")
                        vm[id](vm[propOptions]()[value][key]());
                  }.bind(vm);

                  var bindListbox = listbox.attr("data-bind");
                  if (typeof bindListbox === "undefined")
                     bindListbox = "";

                  bindListbox += bindListbox.length > 0 ? ", " : "";
                  bindListbox += "foreach: " + propOptions;
                  bindListbox += ", attr: { selected: " + id + ".$selected() }";
                  listbox.attr("data-bind", bindListbox);
                  listbox.on("iron-select", function () { vm[id].$selected(this.selected) });
                  vm[propOptions].$bound = true;
                  vm[propValue].$bound = true;

                  var item = listbox.find("paper-item");
                  if (item.length > 0 && vm.hasOwnProperty(propText)) {
                     var bindItem = item.attr("data-bind");
                     if (typeof bindItem === "undefined")
                        bindItem = "";

                     bindItem += bindItem.length > 0 ? ", " : "";
                     bindItem += "html: " + vm[propText]();
                     item.attr("data-bind", bindItem);
                     vm[propText].$bound = true;
                  }
               }
               vm[id].$bound = true;
            }
            else if (tagName == "paper-input") {
               var type = elem.type;
               if (type == "search")
                  bind += "textInput: " + id;
               else
                  bind += "value: " + id;
               vm[id].$bound = true;
            }
            else if (tagName == "paper-menu") {
               var propOptions = id + "_options";
               var propText = id + "_optionsText";
               var propValue = id + "_optionsValue";

               if (vm.hasOwnProperty(propOptions) && vm.hasOwnProperty(propValue)) {
                  var key = vm[propValue]();

                  bind += "foreach: " + propOptions;
                  vm[propOptions].$bound = true;
                  vm[propValue].$bound = true;

                  var item = $(elem).find("paper-item");
                  if (item.length > 0 && vm.hasOwnProperty(propText)) {
                     var bindItem = item.attr("data-bind");
                     if (typeof bindItem === "undefined")
                        bindItem = "";

                     bindItem += bindItem.length > 0 ? ", " : "";
                     bindItem += "html: " + vm[propText]();
                     bindItem += ", click: function() { $root['" + id + "']($data." + key + "()) }";
                     item.attr("data-bind", bindItem);
                     vm[propText].$bound = true;
                  }
               }
            }
            else if (tagName == "paper-progress") {
               bind += "attr: {value: " + id + "}";
               vm[id].$bound = true;
            }
            else if (tagName == "paper-radio-group") {
               bind += "attr: { selected: " + id + " }";
               $(elem).on("paper-radio-group-changed", function () { vm[id](this.selected) });
               vm[id].$bound = true;
            }

            bind = bind.replace(/,\s*$/, "");
            return bind;
         }
      }
}))