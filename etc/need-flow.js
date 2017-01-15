module.exports = function(context) {

    return {
        Program: function(node) {
            var comments = node.comments;
            comments = comments.filter(function(comment) {
                return !(!comment.loc || !comment.loc.start || !comment.loc.start.line || comment.loc.start.line > 1);
            });
            if (comments.length < 1) {
                context.report(node, 'Kein Block-Kommentar in der ersten Zeile');
                return;
            }
            if (!/@flow/.test(comments[0].value)) {
                context.report(node, 'Erster Block-Kommentar beinhaltet kein @flow');
            }
        }
    };
};