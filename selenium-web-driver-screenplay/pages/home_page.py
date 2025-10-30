from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText

from questions.browser_url import BrowserURL
from questions.element_is_visible import ElementIsVisible
from questions.element_text import ElementText


class HomePage:
    """Page Object representing the Stickify Home Page."""

    # --- MAIN ELEMENTS ---
    SONG_CARD = Target.the("song card").located_by("app-song-card")
    SONG_MODAL = Target.the("song modal").located_by("app-song-modal")
    HEADER_COMPONENT = Target.the("header component").located_by("app-header")
    ASIDE_COMPONENT = Target.the("aside component").located_by("app-aside")
    NAV_COMPONENT = Target.the("navigation component").located_by("app-nav")
    MUSIC_RESULTS = Target.the("music results section").located_by("#musicResults")

    # --- MODAL ELEMENTS ---
    MODAL_CLOSE = Target.the("modal close button").located_by("app-song-modal .close")
    MODAL_RATING = Target.the("modal rating section").located_by("app-song-modal .rating-section")
    MODAL_COMMENT_INPUT = Target.the("modal comment input").located_by("app-song-modal .comment-input input")
    MODAL_COMMENT_SUBMIT = Target.the("modal comment submit").located_by("app-song-modal .comment-input button")

    # --- FILTERS AND SEARCH ---
    SEARCH_TOGGLE = Target.the("search filter toggle").located_by("#searchToggle")
    SEARCH_INPUT = Target.the("search input").located_by("#searchInput")

    GENRE_TOGGLE = Target.the("genre toggle button").located_by("#genreToggle")
    DATE_TOGGLE = Target.the("date toggle button").located_by("#dateToggle")
    ARTIST_TOGGLE = Target.the("artist toggle button").located_by("#artistToggle")

    DATE_INPUT = Target.the("year input").located_by("#dateFilters input")
    DATE_CLOSE = Target.the("date filter close button").located_by("#dateFilters .close-filter")
    GENRE_CLOSE = Target.the("genre filter close button").located_by("#genreFilters .close-filter")
    ARTIST_CLOSE = Target.the("artist filter close button").located_by("#artistFilters .close-filter")
    # --- ACTIONS ---

    @staticmethod
    def enter_search_term(term: str):
        """Open search (if collapsed) and enter a song title."""
        return [
            Wait(5).for_the(HomePage.SEARCH_INPUT).to_appear(),
            Click.on(HomePage.SEARCH_INPUT),
            Enter.the_text(term).into(HomePage.SEARCH_INPUT),
        ]

    # @staticmethod
    # def open_first_song():
    #     """Click on the first visible song card."""
    #     return [
    #         Wait(10).for_the(HomePage.SONG_CARD).to_appear(),
    #         Click.on(HomePage.SONG_CARD),
    #         Wait(10).for_the(HomePage.SONG_MODAL).to_appear(),
    #     ]

    # @staticmethod
    # def close_song_modal():
    #     """Close the song modal."""
    #     return Click.on(HomePage.MODAL_CLOSE)

    # @staticmethod
    # def rate_song(rating: int):
    #     """Click a star to rate the song (1-5)."""
    #     rating_star = Target.the(f"{rating} star rating").located_by(
    #         f"app-song-modal .rating-stars button:nth-child({rating})"
    #     )
    #     return Click.on(rating_star)

    # @staticmethod
    # def enter_comment(comment: str):
    #     """Type a comment in the modal."""
    #     return Enter.the_text(comment).into(HomePage.MODAL_COMMENT_INPUT)

    # @staticmethod
    # def submit_comment():
    #     """Submit the comment in the modal."""
    #     return Click.on(HomePage.MODAL_COMMENT_SUBMIT)

    # # --- FILTERS ---
    # @staticmethod
    # def select_year(year: str):
    #     """Click toggle, wait for input, type year."""
    #     return [
    #         Click.on(HomePage.DATE_TOGGLE),
    #         print("Debug: Clicked on DATE_TOGGLE working"),
    #         Wait(5).for_the(HomePage.DATE_INPUT).to_appear(),
    #         Click.on(HomePage.DATE_INPUT),
    #         Enter.the_text(year).into(HomePage.DATE_INPUT),
    #     ]

    # @staticmethod
    # def select_genre(genre: str):
    #     """Click toggle, then select checkbox by id or label."""
    #     checkbox = Target.the(f"checkbox for genre '{genre}'").located_by(
    #         f"#genreFilters input[id='{genre}'], #genreFilters input[value='{genre}']"
    #     )
    #     return [
    #         Click.on(HomePage.GENRE_TOGGLE),
    #         Wait(5).for_the(checkbox).to_appear(),
    #         Click.on(checkbox),
    #     ]

    # @staticmethod
    # def select_artist(artist: str):
    #     """Click toggle, then select artist checkbox."""
    #     checkbox = Target.the(f"checkbox for artist '{artist}'").located_by(
    #         f"#artistFilters input[id='{artist}'], #artistFilters input[value='{artist}']"
    #     )
    #     return [
    #         Click.on(HomePage.ARTIST_TOGGLE),
    #         Wait(5).for_the(checkbox).to_appear(),
    #         Click.on(checkbox),
    #     ]

    # # --- VALIDATIONS ---
    # @staticmethod
    # def song_list_is_visible():
    #     return See.the(ElementIsVisible(HomePage.MUSIC_RESULTS), IsEqualTo(True))

    # @staticmethod
    # def song_modal_is_visible():
    #     return See.the(ElementIsVisible(HomePage.SONG_MODAL), IsEqualTo(True))

    # @staticmethod
    # def url_is(expected_url: str):
    #     return See.the(BrowserURL(), IsEqualTo(expected_url))

    # @staticmethod
    # def components_are_visible():
    #     return [
    #         See.the(ElementIsVisible(HomePage.HEADER_COMPONENT), IsEqualTo(True)),
    #         See.the(ElementIsVisible(HomePage.ASIDE_COMPONENT), IsEqualTo(True)),
    #         See.the(ElementIsVisible(HomePage.NAV_COMPONENT), IsEqualTo(True)),
    #     ]

    # @staticmethod
    # def search_results_contain(text: str):
    #     return See.the(ElementText(HomePage.MUSIC_RESULTS), ContainsTheText(text))

    # @staticmethod
    # def has_songs_displayed():
    #     return See.the(ElementIsVisible(HomePage.SONG_CARD), IsEqualTo(True))
    @staticmethod
    def open_first_song():
        """Click on the first visible song card."""
        return [
            Wait(10).for_the(HomePage.SONG_CARD).to_appear(),
            Click.on(HomePage.SONG_CARD),
            Wait(10).for_the(HomePage.SONG_MODAL).to_appear(),
        ]

    @staticmethod
    def close_song_modal():
        """Close the song modal."""
        return Click.on(HomePage.MODAL_CLOSE)

    @staticmethod
    def rate_song(rating: int):
        """Click a star to rate the song (1-5)."""
        rating_star = Target.the(f"{rating} star rating").located_by(
            f"app-song-modal .rating-stars button:nth-child({rating})"
        )
        return Click.on(rating_star)

    @staticmethod
    def enter_comment(comment: str):
        """Type a comment in the modal."""
        return Enter.the_text(comment).into(HomePage.MODAL_COMMENT_INPUT)

    @staticmethod
    def submit_comment():
        """Submit the comment in the modal."""
        return Click.on(HomePage.MODAL_COMMENT_SUBMIT)

    # --- FILTERS ---
    @staticmethod
    def select_year(year: str):
        """Click toggle, wait for input, type year, then close."""
        return [
            Click.on(HomePage.DATE_TOGGLE),
            Wait(5).for_the(HomePage.DATE_INPUT).to_appear(),
            Enter.the_text(year).into(HomePage.DATE_INPUT),
            Click.on(HomePage.DATE_CLOSE),  # Close the filter after entering
        ]

    @staticmethod
    def select_genre(genre: str):
        """Click toggle, then select checkbox by id."""
        checkbox = Target.the(f"checkbox for genre '{genre}'").located_by(
            f"#genreFilters input[id='{genre}']"
        )
        return [
            Click.on(HomePage.GENRE_TOGGLE),
            Wait(5).for_the(checkbox).to_appear(),
            Click.on(checkbox),
        ]

    @staticmethod
    def select_artist(artist: str):
        """Click toggle, then select artist checkbox."""
        checkbox = Target.the(f"checkbox for artist '{artist}'").located_by(
            f"#artistFilters input[id='{artist}']"
        )
        return [
            Click.on(HomePage.ARTIST_TOGGLE),
            Wait(5).for_the(checkbox).to_appear(),
            Click.on(checkbox),
        ]

    # --- VALIDATIONS ---
    @staticmethod
    def song_list_is_visible():
        return See.the(ElementIsVisible(HomePage.MUSIC_RESULTS), IsEqualTo(True))

    @staticmethod
    def song_modal_is_visible():
        return See.the(ElementIsVisible(HomePage.SONG_MODAL), IsEqualTo(True))

    @staticmethod
    def url_is(expected_url: str):
        return See.the(BrowserURL(), IsEqualTo(expected_url))

    @staticmethod
    def components_are_visible():
        return [
            See.the(ElementIsVisible(HomePage.HEADER_COMPONENT), IsEqualTo(True)),
            See.the(ElementIsVisible(HomePage.ASIDE_COMPONENT), IsEqualTo(True)),
            See.the(ElementIsVisible(HomePage.NAV_COMPONENT), IsEqualTo(True)),
        ]

    @staticmethod
    def search_results_contain(text: str):
        return See.the(ElementText(HomePage.MUSIC_RESULTS), ContainsTheText(text))

    @staticmethod
    def has_songs_displayed():
        return See.the(ElementIsVisible(HomePage.SONG_CARD), IsEqualTo(True))