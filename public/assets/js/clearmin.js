window.CM = {
  init(config) {
    if (typeof config !== 'undefined')
	    { 
for (let attr in config)
      {this.config[attr] = config[attr];}
 }
    if ((this.config.restoreMenuState) && ($.cookie('cm-menu-toggled') == 'true'))
	    { $('body').addClass('cm-menu-toggled'); }

    $('body').append('<div id="cm-menu-backdrop" class="visible-xs-block visible-sm-block"></div>'
			 + '<div id="cm-submenu-popover" class="dropdown">'
			 + '<div data-toggle="dropdown"></div>'
			 + '<div class="popover cm-popover right">'
			 + '<div class="arrow"></div><div class="popover-content"><ul></ul></div></div></div>');


    this.menu.init();
    this.search.init();
    this.navbars.init();
    this.breadcrumb.init();
    this.tabs.init();
    this.cmPopovers.init();
    this.fixHeight.init();
    if (typeof Touch !== 'undefined')
    {
	    FastClick.attach(document.body);
	    if (this.config.menuSwiper)
      { this.swiper.init(this); }
    }
    const self = this;
    $("[data-toggle='popover']").popover();
    $('.modal').on('show.bs.modal', () => { self.preventScroll.enable(); });
    $('.modal').on('hidden.bs.modal', () => { self.preventScroll.disable(); });
    console.log('Removing class 1');
    $(window).load(() => { $('body').removeClass('cm-no-transition'); });
  },

  config: {
    navbarHeight: 50,
    menuSwiper: true,
    menuSwiperIOS: true,
    restoreMenuState: true
  },

  fixHeight: {
    init()
    {
      $(window).load(this.process);
      $(window).resize(this.process);
    },
    process()
    {
      $('.row.cm-fix-height .panel-body').css('min-height', '0px');
      $('.row.cm-fix-height').each(function () {
        let mh = 0;
        $(this).find('.panel-body').each(function () {
          const h = $(this).outerHeight();
          if (h > mh) mh = h;
        }).css('min-height', `${mh}px`);
      });
    }
  },

  afterTransition(f)
  {
    setTimeout(f, 150);
  },

  breadcrumb: {
    init() {
	    const bc = $('.cm-navbar .breadcrumb');
	    if (bc.size())
	    {
        const c = bc.parent();
        const f = function () {
		    bc.removeClass('lonely');
		    bc.find('li.active.ellipsis').remove();
		    bc.find('li').removeAttr('style');
		    let i = 0;
		    const t = bc.find('li').size() - 1;
		    while ((bc.outerWidth() > (c.outerWidth() - 15)) && i < t)
		    {
            i++;
            l = bc.find('li:visible:first').hide();
		    }
		    const n = bc.find('li:visible').size();
		    if ((n > 1) && i)
          { bc.prepend('<li class="active ellipsis">&#133;</li>'); }
		    else if (n == 1)
		    {
            bc.addClass('lonely');
            bc.find('li:visible:first').width(c.width());
		    }
        };
	    $(window).load(f);
	    $(window).resize(f);
	    }
    }
  },

  tabs: {
    init() {
	    let noanim = true;
      $('.cm-navbar .nav-tabs li').click(function () {
        const t = $(this);
        const container = t.parent('.nav-tabs');
        const p = container.scrollLeft() + t.position().left;
        const w = t.outerWidth();
        const c = container.width();
        const s = Math.max(p - ((c - w) / 2), 0);
        if (noanim)
        {
		    container.scrollLeft(s);
		    noanim = false;
        }
        else
        { container.animate({ scrollLeft: s }, 100); }
      });
      $('.cm-navbar .nav-tabs').mousewheel(function (e) {
        const d = e.deltaY * e.deltaFactor * -1;
        $(this).scrollLeft($(this).scrollLeft() + d);
        return false;
      });
      $('.cm-navbar .nav-tabs li.active').click();
    }
  },

  navbars: {
    init() {
	    const self = this;
      const nav = $('.cm-navbar-slideup');
	    const g = $('#global');
      this.l = $(document).scrollTop();
      this.c = 0;
      if (nav.size())
      { $(document).scroll(() => {
		    if(!g.hasClass('prevent-scroll'))
		    {
			var o = $(document).scrollTop();
			var s = Math.max(Math.min(self.c-o+self.l, 0), -CM.config.navbarHeight-1);
			if(o <= 0){
                            nav.css('transform', 'translateY(0px)');
                            s = 0;
			}
			else
			{
                            nav.css('transform', 'translateY('+s+'px)');
			}
			self.c = s;
			self.l = o;
		    }
                }); 
}
    }
  },

  search: {

    init()
    {
	    this.open = $('#cm-search-btn').hasClass('open');
	    this.toggeling = false;
	    const self = this;
	    $("[data-toggle='cm-search']").click(() => {
        if (!self.open && !self.toggeling)
        {
		    self.open = true;
		    $('#cm-search input').focus();
        }
	    });

	    $("[data-toggle='cm-search']").mousedown(() => {
        self.toggeling = self.open;
	    });

	    $('#cm-search input').focus(() => {
        $('#cm-search').addClass('open');
        $('#cm-search-btn').addClass('open');
        self.open = true;
	    });

	    $('#cm-search input').blur(() => {
        $('#cm-search').removeClass('open');
        CM.afterTransition(() => {
		    $('#cm-search-btn').removeClass('open');
		});
        self.open = false;
	    });


    }

  },

  preventScroll: {
    s: -1,
    enable() {
	    this.s = $(document).scrollTop();

	    const f = $('.cm-footer');
	    const x = $(window).height() + this.s - f.position().top - CM.config.navbarHeight;
	    f.css('bottom', `${x }px`);
	    $('#global').addClass('prevent-scroll').css('margin-top', `-${this.s }px`);
    },
    disable() {
	    $('#global').removeAttr('style').removeClass('prevent-scroll');
	    $('.cm-footer').removeAttr('style');
	    if (this.s != -1) $(document).scrollTop(this.s);
    }
  },

  getState() {
    const state = {};
    state.mobile = ($('#cm-menu-backdrop').css('display') == 'block');
    state.open = (state.mobile == $('body').hasClass('cm-menu-toggled'));
    return state;
  },

  cmPopovers: {
    init() {
	    $('.cm-navbar .popover').each(function () {
        const m = 10;/* minimum doc border space */
        const w = $(this).outerWidth();
        const d = $('body').outerWidth() - m;
        let p = (-w / 2) + (CM.config.navbarHeight / 2);
        const b = $(this).parent().offset().left + (CM.config.navbarHeight / 2);
        const x = b + w / 2;
        const y = b - w / 2;
        if (x > d)
        {
          var o = x - d;
          p -= o;
          $(this).children('.arrow').css('left', w / 2 + o);
        }
        else if (y < m)
        {
          var o = y - m;
          p -= o;
          $(this).children('.arrow').css('left', w / 2 + o);
        }
        $(this).css('left', p);
      });
    }
  },

  menu: {
    init() {
	    let scroll = 0;
	    const self = this;

	    $('.cm-submenu ul').click((e) => { e.stopPropagation(); });
	    $('#cm-menu-scroller').scroll(this.hidePopover);
	    $("[data-toggle='cm-menu']").click(this.toggle);
	    $('#cm-menu-backdrop').click(() => { $('body').removeClass('cm-menu-toggled'); });
	    $('#cm-menu-scroller').mousewheel((e) => {
        let n = CM.config.navbarHeight + 1;
        let s = e.deltaY * n + scroll;
        let max = -$(window).height() + n;
        $('.cm-menu-items > li, .cm-submenu.open > ul').each(function () {
		    max += $(this).height();
        });
        s = Math.max(Math.min(s, 0), -n * Math.ceil(max / n));
        s = Math.min(s, 0);
        $('.cm-menu-items').css('transform', `translateY(${  s  }px)`);
        scroll = s;
        self.hidePopover();
        return false;
	    });

	    $('#cm-menu a').click(function () {
        const state = CM.getState();
        const href = $(this).attr('href');
        if (href)
        {
		    if (state.mobile)
		    {
            $('body').removeClass('cm-menu-toggled');
            $.cookie('cm-menu-toggled', false, { path: '/' });
		    }
		    if (!$(this).parents('.cm-submenu').size())
		    {
            $('.cm-menu-items li').removeAttr('style');
            $('.cm-submenu').removeClass('open');
		    }
        }
	    });

	    $('.cm-submenu').click(function (e, notrans, nopopo) {
        const m = $(this);
        const state = CM.getState();
        if ((!state.mobile) && (!state.open))
        {
		    self.setPopover(m);
		    return false;
        }
        const open = m.hasClass('open');
        $('.cm-submenu').removeClass('open');
        $('.cm-menu-items li').removeAttr('style');
        if (!open)
        {
		    m.addClass('open');
		    m.nextAll().css('transform', `translateY(${ m.children('ul').height() }px)`);
        }
	    });

	    const state = CM.getState();
	    if ((!state.mobile) && (!state.open))
	    {
        $('.cm-submenu.pre-open').removeClass('pre-open');
	    }
	    else
	    {
        const po = $('.cm-submenu.pre-open');
        po.nextAll().css('transform', `translateY(${po.children('ul').height()}px)`);
        po.addClass('open').removeClass('pre-open');
	    }

    },

    hidePopover()
    {
	    $('#cm-submenu-popover').removeClass('open');
    },

    setPopover(li)
    {
	    const p = $('#cm-submenu-popover');
	    const open = p.hasClass('open');
	    const popen = li.hasClass('popen');
	    $('.cm-submenu').removeClass('popen');
	    if (popen && open) { this.hidePopover(); return true; }
	    $('#cm-submenu-popover ul').html(li.find('ul').html());
	    const m = 10;
	    const d = $(window).height() - m;
	    const a = $('#cm-submenu-popover').find('.arrow');
	    const h = p.find('.popover').height();
	    let y = li.position().top + CM.config.navbarHeight * 1.5 - h / 2;
	    const x = y + h;
      a.show();
	    if (x > d) {
        var o = x - d;
        y -= o;
        a.css('top', h / 2 + o);
      }
      else if (y < m) {
        var o = y - m;
        y -= o;
        a.css('top', h / 2 + o);
      }
      else {
        a.css('top', '50%');
      }
      if (a.position().top > h) {
        a.hide();
      }
	    p.css('top', y);
	    li.addClass('popen');
	    if (!open)
      { $("#cm-submenu-popover [data-toggle='dropdown']").click(); }
    },

    toggle() {
      $('.container-fluid').addClass('animate');
	    $('body').toggleClass('cm-menu-toggled');
	    const state = CM.getState();
	    if (!state.mobile) {
        $('.cm-submenu').removeClass('open');
        $('.cm-menu-items li').removeAttr('style');
        $(window).resize();
        $.cookie('cm-menu-toggled', (!state.open), { path: '/' });
      } else {
        $.cookie('cm-menu-toggled', false, { path: '/' });
        state.open ? CM.preventScroll.enable() : CM.preventScroll.disable();
	    }
    }
  },

  swiper: {
    init() {
	    const self = this;
	    this.lock = false;
      this.menu = $('#cm-menu');
      this.mask = $('#cm-menu-backdrop');
      this.mwidth = this.menu.width();
	    this.ios = navigator.vendor.indexOf('Apple') == 0 && /\sSafari\//.test(navigator.userAgent);
	    if (this.ios && (!CM.config.menuSwiperIOS)) return false;
	    const triggers = $("[data-toggle='cm-menu']");
	    $(triggers).bind('touchstart', function (e) { $(this).addClass('active'); return false; });
	    $(triggers).bind('touchmove', (e) => false);
	    $(triggers).bind('touchend', function (e) { $(this).removeClass('active'); $(this).click(); return false; });
	    $(triggers).bind('touchcancel', function (e) { $(this).removeClass('active'); $(this).click(); return false; });
	    $(document).bind('touchstart', (e) => self.start(e));
      $(document).bind('touchmove', (e) => self.move(e));
      $(document).bind('touchend', (e) => self.end(e));
      $(document).bind('touchcancel', (e) => self.end(e));
    },

    start(e)
    {
	    this.threshold = false;
	    const touch = e.originalEvent.changedTouches[0];
	    const openMinPos = this.ios ? 10 : 0;
	    const openMaxPos = this.ios ? 90 : 50;
	    this.lt = Date.now();
	    this.lx = touch.clientX;
	    this.mobile = (this.mask.css('display') == 'block');
	    this.open = (this.mobile == $('body').hasClass('cm-menu-toggled'));
	    this.xStart = touch.clientX;
	    this.yStart = touch.clientY;
	    this.lock = ((this.mobile && !this.open && ((this.xStart > openMaxPos) || (this.xStart < openMinPos)))
			 || (!this.mobile));
	    if (this.mobile && this.open)
      { this.xStart = Math.min(this.xStart, this.mwidth); }
	    if (!this.lock) {
        $('body').addClass('cm-no-transition');
	    }
	    return true;
    },

    move(e)
    {
	    const touch = e.originalEvent.changedTouches[0];
	    const dy = touch.clientY - this.yStart;
	    const t = Date.now();
	    this.m = Math.abs(touch.clientX - this.lx) / (t - this.lt);
	    this.lx = touch.clientX;
	    this.lt = t;
	    this.dx = touch.clientX - this.xStart;
	    if ((Math.abs(this.dx) < 10) && (!this.threshold)) {
        this.dx = 0;
	    } else {
        this.threshold = true;
	    }
	    if ((Math.abs(dy) > (Math.abs(this.dx) * 2)) || this.lock)
      { return true; }
	    if (this.mobile && this.open)
	    {
        var x = Math.min(this.mwidth + this.dx, this.mwidth);
        this.translate(this.menu, x);
        this.mask.css('opacity', (x / this.mwidth) / 2);
	    }
	    else if (this.mobile && !this.open)
	    {
        var x = Math.min(this.dx + this.xStart, this.mwidth);
        this.translate(this.menu, x);
        this.mask.css('visibility', 'visible');
        this.mask.css('opacity', (x / this.mwidth) / 2);
	    }
	    return true;
    },

    end(e)
    {
	    if (this.lock) {
        return true;
      }
      console.log('Removing class 2');
	    $('body').removeClass('cm-no-transition');
	    const z = Math.min(Math.max(this.m, 1), 3) * (this.open ? -1 : 1) * this.dx * 2;
	    if (z > this.mwidth)
      { CM.menu.toggle(); }
	    this.menu.removeAttr('style');
      this.mask.removeAttr('style');
	    return true;
    },

    translate(o, x) {
	    o.css('transform', `translateX(${x }px)`);
    }
  }
};

$(() => {
  CM.init({
    navbarHeight: 50,
    menuSwiper: true,
    menuSwiperIOS: true,
    restoreMenuState: true
  })
  ; 
});
