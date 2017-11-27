# iframed

The following code is used to combine Elphel's websites in a single tab of a browser. Those sites use different engines: drupal, wordpress, wikimedia, gitlab and mailing archive

## Features
* Any number of websites in one tab
* Combined search
* If enabled, inter-frame communication follows links to a site that already have a dedicated iframe

## Notes
* \<iframe\> tags are used
* some webservers or websites (like GitLab) must include appropriate headers in the response:
`X-frame-Options: ALLOW-FROM https://www.elphel.com/`
* Elphel's websites have special .htaccesses configuration redirecting requests from non-'elphel' domains to the iframed website: www.elphel.com.
* Individual website can be accessed through the name if the iframe which is a link


## Usage

* Provide a list of target websites in the *$TARGET_LIST* - PHP in *index.php*.
* Set order, number of columns and base width - JS part in *index.php*.
* (optional) To enable inter-frame links following child websites should include the following js code:
```
<script src="https://www.elphel.com/js/elphel_messenger.js"></script>
<script>ElphelMessenger.init();</script>
```