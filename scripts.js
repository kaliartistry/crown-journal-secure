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

  var listenPanel = document.querySelector("[data-audio-reader]");
  if (listenPanel) {
    var listenToggle = listenPanel.querySelector("[data-listen-toggle]");
    var listenStop = listenPanel.querySelector("[data-listen-stop]");
    var listenStatus = listenPanel.querySelector("[data-listen-status]");
    var listenSegments = listenPanel.querySelector("[data-listen-segments]");
    var audioSources = (listenPanel.getAttribute("data-audio-playlist") || "")
      .split(",")
      .map(function (source) {
        return source.trim();
      })
      .filter(Boolean);
    var readyStatus = audioSources.length ? "New York narration ready" : "Browser narration ready";
    var readerState = {
      chunks: [],
      index: 0,
      paused: false,
      speaking: false,
      audio: null,
      utterance: null
    };
    var segmentButtons = [];

    var setListenStatus = function (label) {
      if (listenStatus) {
        listenStatus.textContent = label;
      }
    };

    var setReaderButtons = function (mode) {
      if (!listenToggle || !listenStop) {
        return;
      }
      if (mode === "speaking") {
        listenToggle.textContent = "Pause";
        listenToggle.setAttribute("aria-pressed", "true");
        listenStop.disabled = false;
      } else if (mode === "paused") {
        listenToggle.textContent = "Resume";
        listenToggle.setAttribute("aria-pressed", "true");
        listenStop.disabled = false;
      } else {
        listenToggle.textContent = "Listen";
        listenToggle.setAttribute("aria-pressed", "false");
        listenStop.disabled = true;
      }
    };

    var setActiveSegment = function (activeIndex) {
      segmentButtons.forEach(function (button, index) {
        var isActive = index === activeIndex;
        button.classList.toggle("is-active", isActive);
        if (isActive) {
          button.setAttribute("aria-current", "true");
        } else {
          button.removeAttribute("aria-current");
        }
      });
    };

    var renderAudioSegments = function () {
      if (!listenSegments || !audioSources.length) {
        return;
      }

      listenSegments.textContent = "";
      var label = document.createElement("span");
      label.className = "listen-segments-label";
      label.textContent = "Parts";

      var list = document.createElement("div");
      list.className = "listen-segment-list";

      audioSources.forEach(function (_source, index) {
        var button = document.createElement("button");
        button.className = "listen-segment";
        button.type = "button";
        button.textContent = String(index + 1);
        button.setAttribute("aria-label", "Play part " + (index + 1) + " of " + audioSources.length);
        button.addEventListener("click", function () {
          readerState.index = index;
          readerState.paused = false;
          readerState.speaking = true;
          stopCurrentAudio(true);
          setActiveSegment(index);
          trackEvent("listen_article_segment_select", {
            event_category: "audio_reader",
            mode: "pre_recorded",
            audio_segment: index + 1,
            transport_type: "beacon"
          });
          playNextAudioSegment();
        });
        segmentButtons.push(button);
        list.appendChild(button);
      });

      listenSegments.appendChild(label);
      listenSegments.appendChild(list);
    };

    var stopCurrentAudio = function (resetTime) {
      if (!readerState.audio) {
        return;
      }
      readerState.audio.pause();
      if (resetTime) {
        try {
          readerState.audio.currentTime = 0;
        } catch (error) {
          // Some browsers block currentTime resets before metadata is loaded.
        }
      }
    };

    var cleanText = function (text) {
      return (text || "").replace(/\s+/g, " ").trim();
    };

    var getArticleChunks = function () {
      var chunks = [];
      var article = document.querySelector("[data-listen-article]");
      if (!article) {
        return chunks;
      }
      Array.prototype.slice.call(article.children).some(function (child) {
        if (child.classList && (child.classList.contains("sources") || child.classList.contains("cta-band"))) {
          return true;
        }
        if (child.matches && child.matches("p")) {
          var text = cleanText(child.textContent);
          if (text) {
            chunks.push(text);
          }
        }
        return false;
      });
      return chunks;
    };

    var resetReader = function (status) {
      stopCurrentAudio(true);
      readerState.paused = false;
      readerState.speaking = false;
      readerState.utterance = null;
      setActiveSegment(-1);
      setReaderButtons("idle");
      setListenStatus(status || readyStatus);
    };

    var completeReader = function (mode) {
      trackEvent("listen_article_complete", {
        event_category: "audio_reader",
        mode: mode,
        transport_type: "beacon"
      });
      readerState.index = 0;
      resetReader("Finished");
    };

    var playNextAudioSegment = function () {
      if (!readerState.speaking || readerState.index >= audioSources.length) {
        completeReader("pre_recorded");
        return;
      }

      stopCurrentAudio(false);
      var audio = new Audio(audioSources[readerState.index]);
      readerState.audio = audio;
      audio.preload = "auto";
      audio.addEventListener("ended", function () {
        if (!readerState.speaking) {
          return;
        }
        readerState.index += 1;
        playNextAudioSegment();
      });
      audio.addEventListener("error", function () {
        resetReader("Audio file unavailable");
      });

      setReaderButtons("speaking");
      setActiveSegment(readerState.index);
      setListenStatus("Listening " + (readerState.index + 1) + " of " + audioSources.length);
      audio.play().catch(function () {
        resetReader("Tap Listen to start audio");
      });
    };

    var speakNextChunk = function (speech) {
      if (!readerState.speaking || readerState.index >= readerState.chunks.length) {
        completeReader("browser_speech");
        return;
      }

      var utterance = new SpeechSynthesisUtterance(readerState.chunks[readerState.index]);
      readerState.utterance = utterance;
      utterance.rate = 0.94;
      utterance.pitch = 1;
      utterance.onend = function () {
        if (!readerState.speaking) {
          return;
        }
        readerState.index += 1;
        speakNextChunk(speech);
      };
      utterance.onerror = function () {
        resetReader("Audio reader unavailable in this browser");
      };

      setReaderButtons("speaking");
      setListenStatus("Listening " + (readerState.index + 1) + " of " + readerState.chunks.length);
      speech.speak(utterance);
    };

    if (audioSources.length && listenToggle && listenStop) {
      renderAudioSegments();

      listenToggle.addEventListener("click", function () {
        if (readerState.speaking && !readerState.paused) {
          stopCurrentAudio(false);
          readerState.paused = true;
          setReaderButtons("paused");
          setListenStatus("Paused");
          trackEvent("listen_article_pause", {
            event_category: "audio_reader",
            mode: "pre_recorded",
            transport_type: "beacon"
          });
          return;
        }

        if (readerState.speaking && readerState.paused) {
          var currentAudio = readerState.audio;
          var resumePlayback = currentAudio ? currentAudio.play() : Promise.resolve();
          resumePlayback.then(function () {
            readerState.paused = false;
            setReaderButtons("speaking");
            setListenStatus("Listening " + (readerState.index + 1) + " of " + audioSources.length);
          }).catch(function () {
            resetReader("Tap Listen to start audio");
          });
          trackEvent("listen_article_resume", {
            event_category: "audio_reader",
            mode: "pre_recorded",
            transport_type: "beacon"
          });
          return;
        }

        readerState.index = 0;
        readerState.paused = false;
        readerState.speaking = true;
        trackEvent("listen_article_start", {
          event_category: "audio_reader",
          mode: "pre_recorded",
          audio_segments: audioSources.length,
          transport_type: "beacon"
        });
        playNextAudioSegment();
      });

      listenStop.addEventListener("click", function () {
        if (!readerState.speaking && !readerState.paused) {
          return;
        }
        readerState.speaking = false;
        readerState.paused = false;
        stopCurrentAudio(true);
        readerState.index = 0;
        resetReader("Stopped");
        trackEvent("listen_article_stop", {
          event_category: "audio_reader",
          mode: "pre_recorded",
          transport_type: "beacon"
        });
      });

      window.addEventListener("beforeunload", function () {
        stopCurrentAudio(false);
      });
    } else {
      var speech = window.speechSynthesis;
      if (!speech || typeof SpeechSynthesisUtterance === "undefined") {
        setListenStatus("Audio reader unavailable in this browser");
        if (listenToggle) {
          listenToggle.disabled = true;
        }
      } else if (listenToggle && listenStop) {
        listenToggle.addEventListener("click", function () {
          if (readerState.speaking && !readerState.paused) {
            speech.pause();
            readerState.paused = true;
            setReaderButtons("paused");
            setListenStatus("Paused");
            trackEvent("listen_article_pause", {
              event_category: "audio_reader",
              mode: "browser_speech",
              transport_type: "beacon"
            });
            return;
          }

          if (readerState.speaking && readerState.paused) {
            speech.resume();
            readerState.paused = false;
            setReaderButtons("speaking");
            setListenStatus("Listening " + (readerState.index + 1) + " of " + readerState.chunks.length);
            trackEvent("listen_article_resume", {
              event_category: "audio_reader",
              mode: "browser_speech",
              transport_type: "beacon"
            });
            return;
          }

          readerState.chunks = getArticleChunks();
          if (!readerState.chunks.length) {
            setListenStatus("No article text found");
            return;
          }
          speech.cancel();
          readerState.index = 0;
          readerState.paused = false;
          readerState.speaking = true;
          trackEvent("listen_article_start", {
            event_category: "audio_reader",
            mode: "browser_speech",
            article_chunks: readerState.chunks.length,
            transport_type: "beacon"
          });
          speakNextChunk(speech);
        });

        listenStop.addEventListener("click", function () {
          if (!readerState.speaking && !readerState.paused) {
            return;
          }
          readerState.speaking = false;
          readerState.paused = false;
          speech.cancel();
          readerState.index = 0;
          resetReader("Stopped");
          trackEvent("listen_article_stop", {
            event_category: "audio_reader",
            mode: "browser_speech",
            transport_type: "beacon"
          });
        });

        window.addEventListener("beforeunload", function () {
          speech.cancel();
        });
      }
    }

    if (audioSources.length) {
      setListenStatus(readyStatus);
    }
  }

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
