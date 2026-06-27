(function () {
  var canonicalUrl = "https://kaliartistry.github.io/crown-journal-secure/heavy-is-the-crown-brunson-wanted-the-smoke/";
  var campaignName = "crown_journal_launch";
  var trackEvent = function (eventName, params) {
    if (typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", eventName, params || {});
  };
  var trackedUrl = function (source, medium) {
    return canonicalUrl + "?utm_source=" + encodeURIComponent(source) + "&utm_medium=" + encodeURIComponent(medium) + "&utm_campaign=" + encodeURIComponent(campaignName);
  };

  var copyButtons = document.querySelectorAll("[data-copy-link]");

  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var shareMethod = button.getAttribute("data-share-method") || "copy_link";
      var copyUrl = button.getAttribute("data-copy-url") || trackedUrl("owned_article", shareMethod);
      var original = button.getAttribute("data-original-text") || button.textContent;
      button.setAttribute("data-original-text", original);
      trackEvent("share_article", {
        event_category: "share",
        method: shareMethod,
        link_url: copyUrl,
        transport_type: "beacon"
      });

      var setStatus = function (label) {
        button.textContent = label;
        button.setAttribute("aria-live", "polite");
        window.setTimeout(function () {
          button.textContent = original;
        }, 1600);
      };

      var fallbackCopy = function () {
        var area = document.createElement("textarea");
        area.value = copyUrl;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (error) {
          ok = false;
        }
        document.body.removeChild(area);
        return ok;
      };

      var writeText = navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(copyUrl)
        : Promise.reject(new Error("Clipboard API unavailable"));

      writeText.then(function () {
        setStatus("Copied");
        trackEvent("copy_link_result", {
          event_category: "share",
          status: "success",
          transport_type: "beacon"
        });
      }).catch(function () {
        var copied = fallbackCopy();
        setStatus(copied ? "Copied" : "Copy manually");
        trackEvent("copy_link_result", {
          event_category: "share",
          status: copied ? "fallback_success" : "failed",
          transport_type: "beacon"
        });
      });
    });
  });

  document.querySelectorAll("[data-share-link]").forEach(function (link) {
    link.addEventListener("click", function () {
      trackEvent("share_article", {
        event_category: "share",
        method: link.getAttribute("data-share-method") || "unknown",
        link_url: link.href,
        transport_type: "beacon"
      });
    });
  });

  document.querySelectorAll("[data-track-nav]").forEach(function (link) {
    link.addEventListener("click", function () {
      trackEvent("article_anchor_click", {
        event_category: "navigation",
        link_name: link.getAttribute("data-track-nav"),
        transport_type: "beacon"
      });
    });
  });

  document.querySelectorAll(".sources a").forEach(function (link) {
    link.addEventListener("click", function () {
      var sourceItem = link.closest("li");
      trackEvent("source_note_click", {
        event_category: "source_notes",
        source_id: sourceItem ? sourceItem.id : "unknown",
        link_url: link.href,
        transport_type: "beacon"
      });
    });
  });

  document.querySelectorAll("[data-track-outbound]").forEach(function (link) {
    link.addEventListener("click", function () {
      trackEvent("publisher_link_click", {
        event_category: "outbound",
        link_name: link.getAttribute("data-track-outbound"),
        link_url: link.href,
        transport_type: "beacon"
      });
    });
  });

  var progress = document.querySelector(".reading-progress span");
  if (progress) {
    var scrollMilestones = [25, 50, 75, 90];
    var sentMilestones = {};
    var updateProgress = function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var percent = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
      progress.style.width = percent + "%";
      scrollMilestones.forEach(function (milestone) {
        if (!sentMilestones[milestone] && percent >= milestone) {
          sentMilestones[milestone] = true;
          trackEvent("article_scroll_depth", {
            event_category: "engagement",
            percent_scrolled: milestone,
            transport_type: "beacon"
          });
        }
      });
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
  }
})();
