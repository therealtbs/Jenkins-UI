// Change this to reflect your environment
var jenkinsPath = 'http://ci.therealtbs.me',
loadFromExternal = true,
externalUri = 'http://builds.therealtbs.me/';

$(function () {
    $("select").hide();
    $.get("http://api.bootswatch.com/3/", function (data) {
        var themes = data.themes,
        select = $("select");
        select.show();


        themes.forEach(function(value, index){
            select.append($("<option />")
                .val(index)
                .text(value.name));
        });

        select.change(function(){
            var theme = themes[$(this).val()];
            $("#style").attr("href", theme.cssCdn);
            if(typeof(Storage)!=="undefined") {
                localStorage.lastTheme = theme.name;
            }
        });
        if(typeof(Storage)!=="undefined" && localStorage.lastTheme != undefined) {
            themes.forEach(function(val, nr) {
                if (localStorage.lastTheme === val.name) {
                    select.val(nr);
                }
            })
        } else {
            $.each(themes, function(nr, val) {
                if (val.name === 'Yeti') {
                    select.val(nr);
                }
            });
        }
        select.change();
    }, "json").fail(function(){

    });
    if (loadFromExternal) {
        $.getJSON(jenkinsPath + '/api/json?tree=jobs[name,color,url,description,displayName,lastSuccessfulBuild[number,description],builds[number,result,description,changeSet[items[msg]]]]', function (data) {
            $('#content').empty();

            for (var i = 0; i < (data.jobs.length / 2); i++) {
                $('#content').append('<div class="row"></div>')
            }
            data.jobs.forEach(function (i) {
                var html = '<div class="col-lg-6"><div class="panel ' + getClass(i.color) + '">';
                html += '<div class="panel-heading"><span class="panel-title">' + i.displayName + '</span><i data-toggle="tooltip" data-placement="top" title="' + getInfo(i.color) + '" class="fa fa-question-circle fa-lg pull-right"></i></div>';
                html += '<div class=panel-body container"><div class="row"><div class="col-md-8">' + i.description + '</div><div class="col-md-4">';
                if (i.lastSuccessfulBuild !== null && i.lastSuccessfulBuild.description !== null) {
                    var artifacts = $.parseJSON(i.lastSuccessfulBuild.description).artifacts;

                    artifacts.forEach(function (artifact) {
                        html += '<a class="btn btn-primary" href="' + externalUri + i.name + '/' + i.lastSuccessfulBuild.number + '/' + artifact + '">Download <br class="visible-lg"/>' + artifact + '<br class="visible-lg"/> (latest)</a>';
                    });

                }
                html += '</div></div><hr/></div><table class="table table-striped table-hover"><thead><tr><td>#</td><td>Changes</td><td>Download</td></tr></thead><tbody>' + getTableRows(i.builds, i) + '</tbody></table>';
                html += '</div></div>';
                $('#content .row').each(function (nr, i) {
                    if ($(this).length != 2) {
                        $(this).append(html);
                        return false;
                    }
                });
            });
        }).fail(function () {
            $('#content').empty();
            $('#content').append('<div class="alert alert-danger">Could not retrieve Information</div>')
        });
    } else {
        $.getJSON(jenkinsPath + '/api/json?tree=jobs[name,color,url,description,displayName,lastSuccessfulBuild[number,artifacts[fileName,relativePath]],builds[number,result,artifacts[fileName,relativePath],changeSet[items[msg]]]]', function (data) {
            $('#content').empty();
            for (var i = 0; i < (data.jobs.length / 2); i++) {
                $('#content').append('<div class="row"></div>')
            }
            data.jobs.forEach(function (i) {
                var html = '<div class="col-lg-6"><div class="panel ' + getClass(i.color) + '">';
                html += '<div class="panel-heading"><span class="panel-title">' + i.displayName + '</span><i data-toggle="tooltip" data-placement="top" title="' + getInfo(i.color) + '" class="fa fa-question-circle fa-lg pull-right"></i></div>';
                html += '<div class=panel-body container"><div class="row"><div class="col-md-8">' + i.description + '</div><div class="col-md-4">';
                if (i.lastSuccessfulBuild !== null) {
                    var artifacts = i.lastSuccessfulBuild.artifacts;

                    artifacts.forEach(function (artifact) {
                        html += '<a class="btn btn-primary" href="' + jenkinsPath + '/job/' + i.name + '/' + i.lastSuccessfulBuild.number + '/artifact/' + artifact.relativePath + '">Download <br class="visible-lg"/>' + artifact.fileName + '<br class="visible-lg"/> (latest)</a>';
                    });

                }
                html += '</div></div><hr/></div><table class="table table-striped table-hover"><thead><tr><td>#</td><td>Changes</td><td>Download</td></tr></thead><tbody>' + getTableRows(i.builds, i) + '</tbody></table>';
                html += '</div></div>';
                $('#content .row').each(function (nr, i) {
                    if ($(this).length != 2) {
                        $(this).append(html);
                        return false;
                    }
                });
            });
        }).fail(function () {
            $('#content').empty();
            $('#content').append('<div class="alert alert-danger">Could not retrieve Information</div>')
        });
    }


});

function getClass(color) {
    if (color === 'blue' || color === 'blue_anime') {
        return 'panel-success';
    }
    if (color === 'red' || color === 'red_anime') {
        return 'panel-danger';
    }
    if (color === 'yellow' || color === 'yellow_anime') {
        return 'panel-warning';
    }
    if (color === 'grey' || color === 'grey_anime' || color === 'disabled' || color === 'disabled_anime' ||
        color === 'aborted' || color === 'aborted_anime' || color === 'notbuilt' || color === 'notbuilt_anime') {
        return 'panel-default';
    }

}
function getInfo(color) {
    if (color === 'blue' || color === 'blue_anime') {
        return 'The last build has succeeded';
    }
    if (color === 'red' || color === 'red_anime') {
        return 'The last build has failed';
    }
    if (color === 'yellow' || color === 'yellow_anime') {
        return 'The last build was marked as unstable';
    }
    if (color === 'grey' || color === 'grey_anime' || color === 'disabled' || color === 'disabled_anime' ||
        color === 'aborted' || color === 'aborted_anime' || color === 'notbuilt' || color === 'notbuilt_anime') {
        return 'This project doesn\'t seem to be available';
    }

}
function getTableRows(builds, job) {
    var html = "";
    var nr = 0;
    $.each(builds, function (i, build) {
        if (nr++ > 10) return false;
        html += '<tr class="' + getTableClass(build.result) + '"><td>' + build.number + '</td><td>' + formatChangeSet(build.changeSet.items) + '</td><td>' + getDownloadButton(build, job) + '</td></tr>';
    });
    return html;
}
function formatChangeSet(changeSet) {
    var html = '<ol>';
    $.each(changeSet, function (i, change) {
        html += '<li>' + change.msg + '</li>';
    });
    return html + '</ol>';
}
function getTableClass(result) {
    if (result === 'SUCCESS') {
        return 'success';
    }
    if (result === 'FAILURE') {
        return 'danger';
    }
    if (result === 'UNSTABLE') {
        return 'warning';
    }
    if (result === 'NOT_BUILT' || result === 'ABORTED') {
        return '';
    }
}
function getDownloadButton(build, job) {
    if (build.result !== "SUCCESS") return 'No download links available';
    if (build.description === null) return 'No download links available';

    if (loadFromExternal && $.parseJSON(build.description).artifacts.length == 0) return 'No download links available';
    if (loadFromExternal) {
        var html = $('<button>', {
            'class': 'btn btn-primary btn-xs',
            'onclick': 'showDownloadModal("' + job.displayName + '", "' + build.number + '", \'' + build.description + '\', "' + job.name + '")'
        }).text('Download links');
        return html.wrap('<p>').parent().html();
    } else {
        var html = $('<button>', {
            'class': 'btn btn-primary btn-xs',
            'onclick': 'showDownloadModal("' + job.displayName + '", "' + build.number + '", \'' + JSON.stringify(build.artifacts) + '\', "' + job.name + '")'
        }).text('Download links');
        return html.wrap('<p>').parent().html();
    }


}
function showDownloadModal(displayName, number, artifacts, name) {

    $('#download .modal-title').text('Download ' + displayName + ' Build #' + number);
    if (loadFromExternal) {
        $('#download .modal-body').html(listDownloadLinks($.parseJSON(artifacts), name, number));
    } else {
        $('#download .modal-body').html(listDownloadLinks($.parseJSON(artifacts), name, number));
    }
    $('#download').modal()
}
function listDownloadLinks(artifacts, name, number) {
    var html = '';
    $.each(artifacts, function (nr, artifact) {
        if (loadFromExternal) {
            html += '<a class="btn btn-primary" href="' + externalUri + name + '/' + number + '/' + artifact + '">' + artifact + '</a>';
        } else {
            html += '<a class="btn btn-primary" href="' + jenkinsPath + '/job/' + name + '/' + number + '/artifact/' + artifact.relativePath + '">' + artifact.fileName + '</a>';
        }

    });
    return html;
}