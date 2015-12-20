# Jupyter Notebook extensions

This repository contains some extensions for Jupyter Notebook. They have been 
tested on Jupyter 4.0

 * An automatic Table of Contents. Modified from the [ToC extension](https://github.com/minrk/ipython_extensions).
 * A Search/Replace box. Based on the [Search&Replace extension](https://github.com/ipython-contrib/IPython-notebook-extensions/wiki/Search-&-Replace). Note that Jupyter 4.1 already comes with a search & replace dialog in the *Edit* menu.
 * A menubar button to toggle at the same time the header and the toolbar


## ToC extension 

It generates automatically a ToC box from the Notebook Markdown headings.
It will provide automatic numbering for ToC items in nested form (X.Y.Z) 
*except* if the headings already contain numbering, in which case it will 
simply use that numbering. All headings must be numbered as X.Y.Z for 
autonumbering to be switched off, except level 1 headings, which are ignored 
(so that a document-level heading need not be numbered).

The ToC can be toggled by using the button in the toolbar, or by using the `t`
shortcut key. The box can be folded by using the `-` link. Changes in
the notebook headings are automatically propagated to the ToC after a
short delay (update can be forced by using the round arrow in the
box).


## Search/Replace extension

Adds a search box to the notebook toolbar; it can search (or search
and replace) over cells of the notebook.

The search can be case-sensitive or insensitive. Search starts at the
current notebook position up until the notebook last cell (and, if
wrap searching is active, wraps to the first cell). If there are no
more hits, the search icon changes to red.

If there is a selection active, it will be pasted in the search box as
initial search string.

Search is mapped to the `f` (find) keyboard shortcut, and `Shift-f`
maps to the replace operation.


## Toggle headers

A simple button on the main menubar to toggle at the same time the
header and the toolbar. Also mapped to the `Shift-t` shortcut key (in 
command mode).
