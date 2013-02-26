/*
 Concerto Platform - Online Adaptive Testing Platform
 Copyright (C) 2011-2012, The Psychometrics Centre, Cambridge University
 
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; version 2
 of the License, and not any of the later versions.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

test = null;

function Test() {
}
;
OModule.inheritance(Test);

Test.className = "Test";

Test.widgetTypes = {
    table: 1,
    template: 2,
    test: 4,
    QTI: 5
}

Test.onAfterEdit = function()
{
    Test.currentFromLine = -1;
    Test.currentToLine = -1;
    Test.debugStopped = true;
    Test.functionWidgets = [];
};

Test.onAfterImport = function() {
    Template.uiList();
    Table.uiList();
    QTIAssessmentItem.uiList();

    Test.uiTestsChanged();
    Test.uiTablesChanged();
    Test.uiTemplatesChanged();
    Test.uiQTIAssessmentItemsChanged();
}

Test.onAfterAdd = function() {
}

Test.onAfterSave = function()
{
};

Test.onAfterDelete = function() {
    Test.uiTestsChanged();
}

Test.getAddSaveObject = function()
{
    return {
        oid: this.currentID,
        class_name: this.className,
        name: $("#form" + this.className + "InputName").val(),
        open: $("#form" + this.className + "CheckboxOpen").is(":checked") ? 1 : 0
    };
};

Test.getFullSaveObject = function(isNew) {
    if (isNew == null) {
        isNew = false;
    }

    var obj = this.getAddSaveObject();
    obj["parameters"] = Test.getSerializedParameterVariables();
    obj["returns"] = Test.getSerializedReturnVariables();
    obj["description"] = $("#form" + this.className + "TextareaDescription").val();
    obj["loader_Template_id"] = $("#selectLoaderTemplate").val();
    obj["code"] = $("#textareaTestLogic").val();
    return obj;
}

Test.uiSaveValidate = function(ignoreOnBefore, isNew) {
    if (!this.checkRequiredFields([
        $("#form" + this.className + "InputName").val()
    ])) {
        Methods.alert(dictionary["s415"], "alert");
        return false;
    }
    Test.uiSaveValidated(ignoreOnBefore, isNew);
}

Test.logicCodeMirror = null;
Test.codeMirrors = new Array();
Test.uiRefreshCodeMirrors = function() {
    for (var i = 0; i < Test.codeMirrors.length; i++) {
        try {
            Test.codeMirrors[i].refresh();
        }
        catch (err) {

        }
    }
}

Test.uiGoToRelatedObject = function(type, oid) {
    if (oid == 0)
        return;
    switch (type) {
        //templates
        case Test.widgetTypes.template:
            {
                $("#tnd_mainMenu").tabs("select", "#tnd_mainMenu-Template");
                Template.uiEdit(oid);
                break;
            }
            //tables
        case Test.widgetTypes.table:
            {
                $("#tnd_mainMenu").tabs("select", "#tnd_mainMenu-Table");
                Table.uiEdit(oid);
                break;
            }
            //tests
        case Test.widgetTypes.test:
            {
                Test.uiEdit(oid);
                break;
            }
            //QTI
        case Test.widgetTypes.QTIInitialization:
            {
                $("#tnd_mainMenu").tabs("select", "#tnd_mainMenu-QTIAssessmentItem");
                QTIAssessmentItem.uiEdit(oid);
                break;
            }
    }
}

Test.uiTemplatesChanged = function() {
    Test.uiRefreshLoader($("#selectLoaderTemplate").val());
}

Test.uiTestsChanged = function() {
}

Test.uiQTIAssessmentItemsChanged = function() {
}

Test.uiTablesChanged = function() {
}

Test.variableValidation = function(value, special) {
    if (special == null)
        special = true;
    var oldValue = value;
    var newValue = Test.convertVariable(oldValue, special);
    if (oldValue != newValue)
        return false;
    else
        return true;
}

Test.convertVariable = function(value, special) {
    if (special == null)
        special = true;
    if (special) {
        value = value.replace(/[^A-Z^a-z^0-9^\.^_]/gi, "");
        value = value.replace(/\.{2,}/gi, ".");
    }
    else
        value = value.replace(/[^A-Z^a-z^0-9^_]/gi, "");
    value = value.replace(/^([^A-Z^a-z]{1,})*/gi, "");
    value = value.replace(/([^A-Z^a-z^0-9]{1,})$/gi, "");
    return value;
}

Test.getReturnVars = function() {
    var vars = new Array();
    $(".inputReturnVar").each(function() {
        var v = {
            name: $(this).val(),
            section: [Test.sectionDivToObject($(this).parents(".divSection"))],
            type: ["return"]
        };
        var exists = false;
        for (var i = 0; i < vars.length; i++) {
            if (v.name == vars[i].name) {
                vars[i].section = vars[i].section.concat(v.section);
                vars[i].type = vars[i].type.concat(v.type);
                exists = true;
                break;
            }
        }
        if (!exists) {
            vars.push(v);
        }
    });
    return vars;
};

Test.getParameterVars = function() {
    var vars = new Array();
    $(".inputParameterVar").each(function() {
        var v = {
            name: $(this).val(),
            section: [Test.sectionDivToObject($(this).parents(".divSection"))],
            type: ["parameter"]
        };
        var exists = false;
        for (var i = 0; i < vars.length; i++) {
            if (v.name == vars[i].name) {
                vars[i].section = vars[i].section.concat(v.section);
                vars[i].type = vars[i].type.concat(v.type);
                exists = true;
                break;
            }
        }
        if (!exists) {
            vars.push(v);
        }
    });
    return vars;
};

Test.uiVarNameChanged = function(obj) {
    if (obj != null) {
        var oldValue = obj.val();
        if (!Test.variableValidation(oldValue)) {
            var newValue = Test.convertVariable(oldValue);
            obj.val(newValue);
            Methods.alert(dictionary["s1"].format(oldValue, newValue), "info", dictionary["s2"]);
        }
    }
};

Test.uiAddParameter = function() {
    var vars = this.getSerializedParameterVariables();
    var v = {
        name: "",
        description: ""
    };
    vars.push($.toJSON(v));
    this.uiRefreshVariables(vars, null);
};

Test.uiRemoveParameter = function(index) {
    var vars = this.getSerializedParameterVariables();
    vars.splice(index, 1);
    this.uiRefreshVariables(vars, null);
};

Test.uiAddReturn = function() {
    var vars = this.getSerializedReturnVariables();
    var v = {
        name: "",
        description: ""
    };
    vars.push($.toJSON(v));
    this.uiRefreshVariables(null, vars);
};

Test.uiRemoveReturn = function(index) {
    var vars = this.getSerializedReturnVariables();
    vars.splice(index, 1);
    this.uiRefreshVariables(null, vars);
};

Test.getSerializedParameterVariables = function() {
    var vars = new Array();
    $(".table" + this.className + "Parameters tr").each(function() {
        var v = {};
        v["name"] = $(this).find("input").val();
        v["description"] = $(this).find("textarea").val();
        vars.push($.toJSON(v));
    });
    return vars;
}

Test.getSerializedReturnVariables = function() {
    var vars = new Array();
    $(".table" + this.className + "Returns tr").each(function() {
        var v = {};
        v["name"] = $(this).find("input").val();
        v["description"] = $(this).find("textarea").val();
        vars.push($.toJSON(v));
    });
    return vars;
}

Test.uiRefreshVariables = function(parameters, returns) {
    if (parameters == null)
        parameters = this.getSerializedParameterVariables();
    if (returns == null)
        returns = this.getSerializedReturnVariables();

    Methods.uiBlock("#div" + Test.className + "Variables");
    $.post("view/Test_variables.php", {
        oid: this.currentID,
        class_name: this.className,
        parameters: parameters,
        returns: returns
    }, function(data) {
        Methods.uiUnblock("#div" + Test.className + "Variables");
        $("#div" + Test.className + "Variables").html(data);
    })
}

Test.uiRefreshLoader = function(oid) {

    Methods.uiBlock("#div" + Test.className + "Loader");
    $.post("view/Test_loader.php", {
        oid: this.currentID,
        class_name: this.className,
        loader: oid
    }, function(data) {
        Methods.uiUnblock("#div" + Test.className + "Loader");
        $("#div" + Test.className + "Loader").html(data);
    })
}

Test.onScroll = function() {
    if ($("#divTestResponse").length > 0) {
        if ($(window).scrollTop() > $("#divTestResponse").offset().top) {
            $(".divTestVerticalElement").css("position", "fixed");

            $(".divTestVerticalElement:eq(0)").css("top", "0px");
            $(".divTestVerticalElement:eq(1)").css("top", $(".divTestVerticalElement:eq(1)").css("height"));

        } else {
            $(".divTestVerticalElement").css("position", "relative");
            $(".divTestVerticalElement").css("top", "auto");
        }
    }
}

Test.debugWindow = null;

Test.uiStartDebug = function(url, uid) {
    Test.debugStopped = false;
    Test.debugClearOutput();
    Test.logicCodeMirror.toTextArea();
    Test.logicCodeMirror = Methods.iniCodeMirror("textareaTestLogic", "r", true);
    $("#btnStartDebug").button("disable");
    $("#btnStartDebug").button("option", "label", dictionary["s324"]);
    $("#btnStopDebug").button("enable");

    Test.debugWindow = window.open(url);
    Test.debugWindow.onload = function() {
        Test.debugInitializeTest(uid);
    }
}

Test.currentFromLine = -1;
Test.currentToLine = -1;
Test.debugInitializeTest = function(uid) {
    //initialzing
    if (Test.debugStopped)
        return;
    Test.uiChangeDebugStatus(dictionary["s655"]);
    test = new Test.debugWindow.Concerto($(Test.debugWindow.document).find("#divTestContainer"), uid, null, null, Test.currentID, "../query/",
            function(data) {
                if (Test.debugStopped)
                    return;
                switch (parseInt(data.data.STATUS)) {
                    case Concerto.statusTypes.waiting:
                        {
                            Test.debugAppendOutput(data.debug.output);
                            Test.debugAppendOutput("<br />");
                            Test.debugAppendOutput(data.debug.error_output);
                            Test.uiAddOutputLineWidget(Test.currentToLine, data.debug.output);
                            Test.debugSetState(data.debug.state);
                            if (Test.debugIsCurrentLineLast()) {
                                //test finished
                                Test.uiChangeDebugStatus(dictionary["s656"]);
                                Test.debugCloseTestWindow();
                                break;
                            }
                            Test.debugRunNextLine();
                            Test.uiChangeDebugStatus(dictionary["s657"].format(Test.currentFromLine + 1));
                            break;
                        }
                    case Concerto.statusTypes.waitingCode:
                        {
                            Test.debugAppendOutput(data.debug.output);
                            Test.debugAppendOutput("<br />");
                            Test.debugAppendOutput(data.debug.error_output);
                            Test.uiAddOutputLineWidget(Test.currentToLine, data.debug.output);
                            Test.debugSetState(data.debug.state);
                            Test.debugRunNextLine();
                            Test.uiChangeDebugStatus(dictionary["s657"].format(Test.currentFromLine + 1));
                            break;
                        }
                    case Concerto.statusTypes.template:
                        {
                            if (parseInt(data.data.FINISHED) == 1) {
                                Test.debugAppendOutput(data.debug.output);
                                Test.debugAppendOutput("<br />");
                                Test.debugAppendOutput(data.debug.error_output);
                                Test.uiAddOutputLineWidget(Test.currentToLine, data.debug.output);
                                Test.debugSetState(data.debug.state);

                                Test.uiChangeDebugStatus(dictionary["s656"]);
                                Test.debugCloseTestWindow();
                                break;
                            }
                            Test.debugAppendOutput(data.debug.output);
                            Test.debugAppendOutput("<br />");
                            Test.debugAppendOutput(data.debug.error_output);
                            Test.uiAddOutputLineWidget(Test.currentToLine, data.debug.output);
                            //Test.debugSetState(data.debug.state);
                            Test.uiChangeDebugStatus(dictionary["s658"], "ui-state-error");
                            break;
                        }
                    case Concerto.statusTypes.completed:
                        {
                            Test.debugAppendOutput(data.debug.output);
                            Test.debugAppendOutput("<br />");
                            Test.debugAppendOutput(data.debug.error_output);
                            Test.uiAddOutputLineWidget(Test.currentToLine, data.debug.output);
                            Test.debugSetState(data.debug.state);

                            Test.uiChangeDebugStatus(dictionary["s656"]);
                            Test.debugCloseTestWindow();
                            break;
                        }
                    case Concerto.statusTypes.error:
                        {
                            Test.uiChangeDebugStatus(dictionary["s659"].format(Test.currentFromLine + 1), "ui-state-error");
                            Test.debugAppendOutput(data.debug.output);
                            Test.debugAppendOutput("<br />");
                            Test.debugAppendOutput(data.debug.error_output);
                            Test.uiAddOutputLineWidget(Test.currentToLine, data.debug.output);
                            Test.uiAddOutputLineWidget(Test.currentToLine, data.debug.error_output, "ui-state-error");
                            Test.debugSetState(data.debug.state);
                            Test.debugCloseTestWindow();
                            break;
                        }
                    case Concerto.statusTypes.tampered:
                        {
                            Test.uiChangeDebugStatus(dictionary["s660"], "ui-state-error");
                            Test.debugCloseTestWindow();
                            break;
                        }
                }
            },
            function(data) {
            },
            true, false, null, false);
    test.run(null, null);
}
Test.debugCloseTestWindow = function() {
    Test.debugWindow.close();
}
Test.debugClearOutput = function() {
    $("#divTestOutputContent").html("");
}

Test.debugAppendOutput = function(output) {
    $("#divTestOutputContent").append(output);
}

Test.debugSetState = function(state) {
    var obj = $.parseJSON(state);
    var html = "<table style='margin-top:10px;'>";
    for (var k in obj) {
        if (k == "concerto")
            continue;
        html += "<tr><td class='tdStateLabel' valign='top'>" + k + ": </td><td class='tdStateValue' valign='top' style='word-break: break-all;'>" + obj[k] + "</td></tr>";
    }
    html += "</table>";
    $("#divTestSessionStateContent").html(html);
}

Test.debugGetCurrentCode = function() {
    return Test.logicCodeMirror.getRange({
        line: Test.currentFromLine,
        ch: 0
    }, {
        line: Test.currentToLine,
        ch: Test.logicCodeMirror.getLine(Test.currentToLine).length
    });
}

Test.debugIsCurrentLineLast = function() {
    if (Test.logicCodeMirror.lineCount() - 1 == Test.currentToLine)
        return true;
    else
        return false;
}

Test.debugRunNextLine = function() {
    Test.currentFromLine = Test.currentToLine + 1;
    Test.currentToLine = Test.currentFromLine;
    Test.logicCodeMirror.setSelection({
        line: Test.currentFromLine,
        ch: 0
    }, {
        line: Test.currentToLine,
        ch: Test.logicCodeMirror.getLine(Test.currentToLine).length
    });

    var code = Test.debugGetCurrentCode();
    if (code.trim() == "" || (code.length > 0 && code.indexOf("#") == 0)) {
        if (Test.debugIsCurrentLineLast()) {
            Test.uiChangeDebugStatus(dictionary["s656"]);
            Test.debugCloseTestWindow();
        } else {
            Test.debugRunNextLine();
        }
        return;
    }
    test.run(null, null, Test.debugGetCurrentCode());
}

Test.uiChangeDebugStatus = function(label, style) {
    $("#tdTestDebugStatus").html(label);
    $("#tdTestDebugStatus").removeClass("ui-state-highlight");
    $("#tdTestDebugStatus").removeClass("ui-state-error");
    if (style != null) {
        $("#tdTestDebugStatus").addClass(style);
    } else {
        $("#tdTestDebugStatus").addClass("ui-state-highlight");
    }
}

Test.debugStopped = true;
Test.uiStopDebug = function() {
    Test.currentFromLine = -1;
    Test.currentToLine = -1;
    Test.debugStopped = true;

    Test.logicCodeMirror.toTextArea();
    Test.logicCodeMirror = Methods.iniCodeMirror("textareaTestLogic", "r", false, true, true);
    $("#btnStartDebug").button("enable");
    $("#btnStopDebug").button("disable");
    Test.uiChangeDebugStatus(dictionary["s691"]);
}

Test.uiAddOutputLineWidget = function(lineNo, output, style) {

    if (style == null)
        style = "ui-state-highlight";
    var outputLines = output.split("<br />");
    var output = [];
    for (var i = 0; i < outputLines.length; i++) {
        var line = $.trim(outputLines[i]);
        if (line.indexOf("&gt;") == 0 || line.indexOf("+") == 0)
            continue;
        output.push(line);
    }
    if (output.length == 0)
        return;
    var obj = $("<div class='divInlineWidget " + style + "'>" + output.join("<br />") + "</div>")[0];
    if (lineNo != -1)
        Test.logicCodeMirror.addLineWidget(lineNo, obj);
    else
        Test.logicCodeMirror.addLineWidget(lineNo, obj, {
            above: true
        });
}

Test.codeMirrorAutocompleteWidget = null;
Test.autoCompleteDocs = [];
Test.documentationLoaderIsWorking = false;
Test.getFuncDoc = function(func, pack) {
    for (var i = 0; i < Test.autoCompleteDocs.length; i++) {
        var doc = Test.autoCompleteDocs[i];
        if (doc.func == func && doc.pack == pack)
            return doc;
    }
    return null;
}
Test.getDocContent = function(html) {
    html = html.substr(html.indexOf("<body>") + 6);
    html = html.replace("</body></html>", "");
    html = "<div id='divFunctionDoc'>" + html + "</div>";
    return html;
}

Test.functionWidgets = [];
Test.functionWidgetOptionComments = true;
Test.functionWidgetOptionFormat = true;
Test.uiAddFunctionWidget = function(instance, func, html) {
    var date = new Date();
    var id = "func-" + func + "-" + date.getTime() + "-" + Math.floor((Math.random() * 1000));
    id = id.replace(/\./g, "___");

    if (html == null)
        html = $("#divFunctionDoc").html();

    Test.uiRemoveAllFunctionWidgets();
    var parsedDoc = Test.getParsedDoc(func, html);

    var widget = $("<div class='divFunctionWidget ui-widget-content' funcName='" + func + "' id='" + id + "'></div>");
    widget.append("<div class='ui-widget-header divFunctionWidgetTitle divFunctionWidgetElement'>" + parsedDoc.title + "</div>");
    widget.append("<div class='divFunctionWidgetDescription divFunctionWidgetElement'>" + parsedDoc.description + "</div>");

    var cmArgValues = [];

    var argTable = $("<table class='fullWidth'></table>");
    for (var i = 0; i < parsedDoc.arguments.length; i++) {
        var formattedName = parsedDoc.arguments[i].name.replace(/\./g, "___");
        var descSpan = $('<span class="spanIcon ui-icon ui-icon-help functionArgTooltip" title="asd"></span>');
        var descText = $('<div class="notVisible divFunctionWidgetArgDescHelper">' + parsedDoc.arguments[i].description + '</div>')

        argTable.append("<tr argName='" + parsedDoc.arguments[i].name + "'>" +
                "<td class='divFunctionWidgetArgTableDescColumn divFunctionWidgetArgTable'>" + (parsedDoc.arguments[i].description != "" ? (descSpan[0].outerHTML + descText[0].outerHTML) : "") + "</td>" +
                "<td class='divFunctionWidgetArgTableNameColumn divFunctionWidgetArgTable noWrap'>" + parsedDoc.arguments[i].name + "</td>" +
                "<td class='divFunctionWidgetArgTableValueColumn divFunctionWidgetArgTable'><textarea id='" + id + "-" + formattedName + "' class='notVisible'>" + parsedDoc.arguments[i].value + "</textarea></td>" +
                "</tr>");
    }

    widget.append("<div class='divFunctionWidgetElement divFunctionWidgetArgTable'>" + argTable[0].outerHTML + "</div>");

    var optionsCollection = [
        $("<div class='divFunctionWidgetOption'><label for='" + id + "-option-comments'><input type='checkbox' id='" + id + "-option-comments' " + (Test.functionWidgetOptionComments ? "checked" : "") + " />" + dictionary["s684"] + "</label></options>"),
        $("<div class='divFunctionWidgetOption'><label for='" + id + "-option-autoformat'><input type='checkbox' id='" + id + "-option-autoformat' " + (Test.functionWidgetOptionFormat ? "checked" : "") + " />" + dictionary["s685"] + "</label></options>")
    ]
    var options = $("<div class='divFunctionWidgetElement divFunctionWidgetOptions'></div>");
    for (var i = 0; i < optionsCollection.length; i++) {
        options.append(optionsCollection[i]);
    }
    options.append($("<div style='clear:both;' />"));
    widget.append(options);

    widget.append("<div class='divFunctionWidgetElement divFunctionWidgetButtons' align='center'>" +
            "<button class='btnApply' onclick=''>" + dictionary["s683"] + "</button>" +
            "<button class='btnCancel' onclick=''>" + dictionary["s23"] + "</button>" +
            "</div>");

    var fw = instance.addLineWidget(instance.getCursor(true).line, widget[0]);
    fw["widgetID"] = id;

    var chosen = false;
    var chosenCM = null;
    for (var i = 0; i < parsedDoc.arguments.length; i++) {
        var formattedName = parsedDoc.arguments[i].name.replace(/\./g, "___");
        var cm = Methods.iniCodeMirror(id + "-" + formattedName, "r", false, true, false, false);
        if (!chosen) {
            chosenCM = cm;
            chosen = true;
        }
        cmArgValues.push(cm);
    }
    if (chosenCM != null)
        chosenCM.focus();

    Methods.iniIconButton(".btnApply", "disk");
    Methods.iniIconButton(".btnCancel", "cancel");

    $(".functionArgTooltip").tooltip({
        tooltipClass: "tooltipWindow",
        position: {
            my: "left top",
            at: "left bottom",
            offset: "15 0"
        },
        content: function() {
            return $(this).next().html();
        },
        show: false,
        hide: false
    });

    Test.functionWidgets.push(fw);

    widget.find("button.btnCancel").click(function() {
        fw.clear();
    });

    widget.find("button.btnApply").click(function() {
        Test.uiApplyFunctionWidget(fw);
    });
}

Test.uiApplyFunctionWidget = function(fw) {
    var id = fw["widgetID"];
    var widget = $("#" + id);
    var title = widget.find(".divFunctionWidgetTitle").text().replace(/\n/g, "");
    var funcName = widget.attr("funcName");

    Test.functionWidgetOptionComments = $("#" + id + "-option-comments").is(":checked");
    Test.functionWidgetOptionFormat = $("#" + id + "-option-autoformat").is(":checked");

    var result = "";
    if (Test.functionWidgetOptionComments)
        result += "\n# " + title;

    result += "\n" + funcName + "(";

    var table = widget.find(".divFunctionWidgetArgTable table");
    var isFirst = true;
    table.find("tr").each(function() {
        var name = $(this).attr("argName");
        var formattedName = name.replace(/\./g, "___");
        var value = $("#" + id + "-" + formattedName).val();

        if (jQuery.trim(value) == "")
            return;

        if (!isFirst)
            result += ",";
        isFirst = false;
        result += "\n";
        if (Test.functionWidgetOptionComments)
            result += "\n";

        if (Test.functionWidgetOptionComments)
            result += " # " + $(this).find("div.divFunctionWidgetArgDescHelper").text().replace(/\n/g, "") + "\n";

        if (name == "...")
            result += value;
        else {
            result += name + "=" + value;
        }
    });

    result += "\n)";
    Test.logicCodeMirror.replaceRange(result, Test.logicCodeMirror.getCursor());
    fw.clear();

    if (Test.functionWidgetOptionFormat) {
        var range = {
            from: {
                line: 0,
                ch: 0
            },
            to: {
                line: Test.logicCodeMirror.lineCount() - 1,
                ch: Test.logicCodeMirror.getLine(Test.logicCodeMirror.lineCount() - 1).length
            }
        }
        Test.logicCodeMirror.autoFormatRange(range.from, range.to);
        Test.logicCodeMirror.autoIndentRange(range.from, range.to);
        Test.logicCodeMirror.setSelection(range.to);
    }
}

Test.uiRemoveAllFunctionWidgets = function() {
    for (var i = 0; i < Test.functionWidgets.length; i++) {
        if (Test.functionWidgets[i] != null)
            Test.functionWidgets[i].clear();
    }
    Test.functionWidgets = [];
}

Test.getParsedDoc = function(func, html) {
    var parsedDoc = {};
    var obj = $(html);

    parsedDoc["title"] = obj.find("h2").html();
    parsedDoc["description"] = "";
    parsedDoc["usage"] = "";
    obj.find("h3").each(function() {
        if ($(this).html() == "Description")
            parsedDoc["description"] = $(this).next().html();
        if ($(this).html() == "Usage")
            parsedDoc["usage"] = jQuery.trim($(this).next().html()) + "\n";
    });

    parsedDoc["arguments"] = [];
    var usage = parsedDoc["usage"];
    var arguments = usage.substr(usage.indexOf(func + "(") + (func + "(").length);
    arguments = arguments.substr(0, arguments.indexOf(")\n"));
    var split = arguments.split(",");

    var argName = "";
    var argValue = "";
    var specials = [
        {char: "'", close: "'", count: 0},
        {char: '"', close: '"', count: 0},
        {char: "{", close: "}", count: 0},
        {char: "(", close: ")", count: 0},
        {char: "[", close: "]", count: 0}
    ];
    var nullified = false;
    var nullifyingChar = "";
    var continued = false;

    for (var i = 0; i < split.length; i++) {
        if (split[i].indexOf("=") == -1 && !continued) {
            var name = jQuery.trim(split[i]);
            var desc = "";

            obj.find("table[summary='R argblock'] tr").each(function() {
                if ($(this).children("td:eq(0)").children("code").html() == name) {
                    desc = $(this).children("td:eq(1)").children("p").html();
                }
            })

            parsedDoc["arguments"].push({
                name: name,
                value: "",
                description: desc
            });
        }
        else {
            if (!continued) {
                argName = jQuery.trim(split[i].substr(0, split[i].indexOf("=")));
                argValue = jQuery.trim(split[i].substr(split[i].indexOf("=") + 1));

                specials = [
                    {char: "'", close: "'", count: 0},
                    {char: '"', close: '"', count: 0},
                    {char: "{", close: "}", count: 0},
                    {char: "(", close: ")", count: 0},
                    {char: "[", close: "]", count: 0}
                ]

                nullified = false;
                nullifyingChar = "";
            } else {
                argValue += ", " + jQuery.trim(split[i]);
            }
            continued = false;

            var partArgValue = jQuery.trim(split[i]);

            for (var k = 0; k < partArgValue.length; k++) {
                var char = partArgValue[k];

                for (var j = 0; j < specials.length; j++) {
                    if (specials[j].close == char && specials[j].count % 2 == 1) {
                        if (nullified) {
                            if (nullifyingChar == specials[j].char) {
                                nullified = false;
                                nullifyingChar = "";
                                specials[j].count--;
                            }
                        } else {
                            specials[j].count--;
                        }
                        continue;
                    }

                    if (specials[j].char == char) {
                        if (!nullified)
                            specials[j].count++;
                        if (j == 0 || j == 1) {
                            nullified = true;
                            nullifyingChar = specials[j].char;
                        }
                        continue;
                    }

                }
            }

            for (var k = 0; k < specials.length; k++) {
                if (specials[k].count > 0) {
                    continued = true;
                    break;
                }
            }

            if (!continued) {
                var desc = "";
                var name = argName;

                obj.find("table[summary='R argblock'] tr").each(function() {
                    if ($(this).children("td:eq(0)").children("code").html() == name) {
                        desc = $(this).children("td:eq(1)").children("p").html();
                    }
                })

                parsedDoc["arguments"].push({
                    name: argName,
                    value: argValue,
                    description: desc
                });
            }
        }
    }

    parsedDoc["value"] = "";
    $(obj).find("h3").each(function() {
        if ($(this).html() == "Value") {
            var curr = $(this).next();
            while (!curr.is("h3")) {
                parsedDoc["value"] += curr[0].outerHTML;
                curr = curr.next();
            }
        }
    });

    return parsedDoc;
}

Test.uiWriteAutocompleteDoc = function(html) {
    var infoBar = '<div>' +
            '<table>' +
            '<tr><td style="width:30px;"><span class="spanIcon ui-icon ui-icon-info"></span></td>' +
            '<td><b>Ctrl+Enter:</b> ' + dictionary["s689"] + ', <b>Enter:</b> ' + dictionary["s690"] + ', <b>Esc:</b> ' + dictionary["s23"] + '</td>' +
            '</tr>' +
            '</table>' +
            '</div>';
    var html = Test.getDocContent(html);
    $("#divCodeAutocompleteDoc").html(infoBar + html);
}

Test.iniAutoCompleteCodeMirror = function(mode, instance, widgetsPossible) {
    switch (mode) {
        case "r":
            {
                var breakChar = [
                    '"',
                    "'",
                    "(",
                    ")",
                    "[",
                    "]",
                    "{",
                    "}",
                    " ",
                    "-",
                    "+",
                    "*",
                    "/",
                    "!",
                    "%",
                    "|",
                    "^",
                    "&",
                    "=",
                    ","
                ];

                var cursor = instance.getCursor();
                var funcName = "";
                var ch = cursor.ch - 1;
                while (ch >= 0) {
                    var firstChar = instance.getRange({
                        line: cursor.line,
                        ch: ch
                    }, {
                        line: cursor.line,
                        ch: ch + 1
                    });
                    if (breakChar.indexOf(firstChar) != -1) {
                        break;
                    }
                    funcName = instance.getRange({
                        line: cursor.line,
                        ch: ch
                    }, cursor);
                    ch--;
                }
                if (funcName.length > 0) {
                    $("#divCodeAutocomplete").remove();
                    var obj = $("<div id='divCodeAutocomplete' style='position:absolute; z-index:9999;'><table><tr><td valign='top'><select size='5' id='selectCodeAutocomplete' style='min-width:100px;' class='ui-widget-content ui-corner-all'></select></td><td><div id='divCodeAutocompleteDoc' style='min-width:300px; padding:10px;' class='ui-widget-content'>" + dictionary["s664"] + "</td></tr></table></div>");
                    var pos = instance.cursorCoords(false, "page");
                    $("body").append(obj);
                    obj.css("top", pos.top);
                    obj.css("left", pos.left);
                    Methods.uiBlock("#divCodeAutocomplete");
                    $.post("query/r_autocomplete.php", {
                        string: funcName
                    }, function(data) {
                        if (data.functions != null) {
                            for (var i = 0; i < data.functions.length; i++) {
                                var name = data.functions[i].name;
                                var pack = data.functions[i].pack;

                                $("#selectCodeAutocomplete").append("<option value='" + name + "' pack='" + pack + "'>" + name + "</option>");
                            }

                            var code = null;
                            $("#selectCodeAutocomplete").change(function() {
                                var option = $(this).find("option[value='" + $(this).val() + "']");

                                var doc = Test.getFuncDoc(option.attr("value"), option.attr("pack"));
                                if (doc == null) {
                                    $("#divCodeAutocompleteDoc").html(dictionary["s319"]);

                                    if (!Test.documentationLoaderIsWorking) {
                                        Test.documentationLoaderIsWorking = true;
                                        $.post("query/r_documentation.php", {
                                            func: option.attr("value"),
                                            pack: option.attr("pack")
                                        }, function(data) {

                                            Test.autoCompleteDocs.push({
                                                func: option.attr("value"),
                                                pack: option.attr("pack"),
                                                html: data.html
                                            });

                                            Test.uiWriteAutocompleteDoc(data.html);
                                            Test.documentationLoaderIsWorking = false;
                                            $("#selectCodeAutocomplete").change();
                                        }, "json");
                                    }
                                } else {
                                    Test.uiWriteAutocompleteDoc(doc.html);
                                }
                            });
                            $("#selectCodeAutocomplete").blur(function() {
                                $("#divCodeAutocomplete").remove();
                            });
                            $("#selectCodeAutocomplete").keydown(function(e) {
                                code = (e.keyCode ? e.keyCode : e.which);
                                //ctrl + enter
                                if (e.ctrlKey && code == 13) {
                                    if (!widgetsPossible)
                                        return;
                                    var selectedOption = $("#selectCodeAutocomplete").children("option:selected");
                                    if (selectedOption.length == 0)
                                        return;
                                    var doc = Test.getFuncDoc(selectedOption.attr("value"), selectedOption.attr("pack"));
                                    if (doc == null)
                                        return;
                                    Test.uiAddFunctionWidget(instance, selectedOption.attr("value"), Test.getDocContent(doc.html));
                                    $("#selectCodeAutocomplete").blur();
                                    instance.focus();
                                    e.preventDefault();

                                    instance.setSelection({
                                        line: cursor.line,
                                        ch: ch + 1
                                    }, cursor);
                                    instance.replaceSelection("\n");
                                    instance.setSelection(cursor);
                                    return;
                                }
                                //enter
                                if (code == 13) {
                                    var selectedOption = $("#selectCodeAutocomplete").children("option:selected");
                                    if (selectedOption.length == 0)
                                        return;
                                    instance.replaceRange($("#selectCodeAutocomplete").val() + "()", {
                                        line: cursor.line,
                                        ch: ch + 1
                                    }, instance.getCursor());
                                    $("#selectCodeAutocomplete").blur();
                                    instance.focus();
                                    instance.setCursor({line: instance.getCursor().line, ch: instance.getCursor().ch - 1})
                                    e.preventDefault();
                                }
                                //backspace
                                if (code == 8) {
                                    e.preventDefault();
                                }
                                //escape
                                if (code == 27) {
                                    $("#selectCodeAutocomplete").blur();
                                    instance.focus();
                                }
                            });
                            $("#selectCodeAutocomplete").focus();
                        }
                        else {
                            $("#divCodeAutocomplete").remove();
                        }

                        Methods.uiUnblock("#divCodeAutocomplete");
                    }, "json");
                }
                break;
            }
    }
}