export var rough = (function () {
	'use strict';
	function t(t, e, s) {
		if (t && t.length) {
			const [n, a] = e,
				o = (Math.PI / 180) * s,
				h = Math.cos(o),
				r = Math.sin(o);
			t.forEach((t) => {
				const [e, s] = t;
				(t[0] = (e - n) * h - (s - a) * r + n), (t[1] = (e - n) * r + (s - a) * h + a);
			});
		}
	}
	function e(t) {
		const e = t[0],
			s = t[1];
		return Math.sqrt(Math.pow(e[0] - s[0], 2) + Math.pow(e[1] - s[1], 2));
	}
	function s(e, s) {
		const n = s.hachureAngle + 90;
		let a = s.hachureGap;
		a < 0 && (a = 4 * s.strokeWidth), (a = Math.max(a, 0.1));
		const o = [0, 0];
		if (n) for (const s of e) t(s, o, n);
		const h = (function (t, e) {
			const s = [];
			for (const e of t) {
				const t = [...e];
				t[0].join(',') !== t[t.length - 1].join(',') && t.push([t[0][0], t[0][1]]),
					t.length > 2 && s.push(t);
			}
			const n = [];
			e = Math.max(e, 0.1);
			const a = [];
			for (const t of s)
				for (let e = 0; e < t.length - 1; e++) {
					const s = t[e],
						n = t[e + 1];
					if (s[1] !== n[1]) {
						const t = Math.min(s[1], n[1]);
						a.push({
							ymin: t,
							ymax: Math.max(s[1], n[1]),
							x: t === s[1] ? s[0] : n[0],
							islope: (n[0] - s[0]) / (n[1] - s[1])
						});
					}
				}
			if (
				(a.sort((t, e) =>
					t.ymin < e.ymin
						? -1
						: t.ymin > e.ymin
						? 1
						: t.x < e.x
						? -1
						: t.x > e.x
						? 1
						: t.ymax === e.ymax
						? 0
						: (t.ymax - e.ymax) / Math.abs(t.ymax - e.ymax)
				),
				!a.length)
			)
				return n;
			let o = [],
				h = a[0].ymin;
			for (; o.length || a.length; ) {
				if (a.length) {
					let t = -1;
					for (let e = 0; e < a.length && !(a[e].ymin > h); e++) t = e;
					a.splice(0, t + 1).forEach((t) => {
						o.push({ s: h, edge: t });
					});
				}
				if (
					((o = o.filter((t) => !(t.edge.ymax <= h))),
					o.sort((t, e) =>
						t.edge.x === e.edge.x ? 0 : (t.edge.x - e.edge.x) / Math.abs(t.edge.x - e.edge.x)
					),
					o.length > 1)
				)
					for (let t = 0; t < o.length; t += 2) {
						const e = t + 1;
						if (e >= o.length) break;
						const s = o[t].edge,
							a = o[e].edge;
						n.push([
							[Math.round(s.x), h],
							[Math.round(a.x), h]
						]);
					}
				(h += e),
					o.forEach((t) => {
						t.edge.x = t.edge.x + e * t.edge.islope;
					});
			}
			return n;
		})(e, a);
		if (n) {
			for (const s of e) t(s, o, -n);
			!(function (e, s, n) {
				const a = [];
				e.forEach((t) => a.push(...t)), t(a, s, n);
			})(h, o, -n);
		}
		return h;
	}
	class n {
		constructor(t) {
			this.helper = t;
		}
		fillPolygons(t, e) {
			return this._fillPolygons(t, e);
		}
		_fillPolygons(t, e) {
			const n = s(t, e);
			return { type: 'fillSketch', ops: this.renderLines(n, e) };
		}
		renderLines(t, e) {
			const s = [];
			for (const n of t)
				s.push(...this.helper.doubleLineOps(n[0][0], n[0][1], n[1][0], n[1][1], e));
			return s;
		}
	}
	class a extends n {
		fillPolygons(t, n) {
			let a = n.hachureGap;
			a < 0 && (a = 4 * n.strokeWidth), (a = Math.max(a, 0.1));
			const o = s(t, Object.assign({}, n, { hachureGap: a })),
				h = (Math.PI / 180) * n.hachureAngle,
				r = [],
				i = 0.5 * a * Math.cos(h),
				c = 0.5 * a * Math.sin(h);
			for (const [t, s] of o)
				e([t, s]) && r.push([[t[0] - i, t[1] + c], [...s]], [[t[0] + i, t[1] - c], [...s]]);
			return { type: 'fillSketch', ops: this.renderLines(r, n) };
		}
	}
	class o extends n {
		fillPolygons(t, e) {
			const s = this._fillPolygons(t, e),
				n = Object.assign({}, e, { hachureAngle: e.hachureAngle + 90 }),
				a = this._fillPolygons(t, n);
			return (s.ops = s.ops.concat(a.ops)), s;
		}
	}
	class h {
		constructor(t) {
			this.helper = t;
		}
		fillPolygons(t, e) {
			const n = s(t, (e = Object.assign({}, e, { hachureAngle: 0 })));
			return this.dotsOnLines(n, e);
		}
		dotsOnLines(t, s) {
			const n = [];
			let a = s.hachureGap;
			a < 0 && (a = 4 * s.strokeWidth), (a = Math.max(a, 0.1));
			let o = s.fillWeight;
			o < 0 && (o = s.strokeWidth / 2);
			const h = a / 4;
			for (const r of t) {
				const t = e(r),
					i = t / a,
					c = Math.ceil(i) - 1,
					l = t - c * a,
					u = (r[0][0] + r[1][0]) / 2 - a / 4,
					p = Math.min(r[0][1], r[1][1]);
				for (let t = 0; t < c; t++) {
					const e = p + l + t * a,
						r = u - h + 2 * Math.random() * h,
						i = e - h + 2 * Math.random() * h,
						c = this.helper.ellipse(r, i, o, o, s);
					n.push(...c.ops);
				}
			}
			return { type: 'fillSketch', ops: n };
		}
	}
	class r {
		constructor(t) {
			this.helper = t;
		}
		fillPolygons(t, e) {
			const n = s(t, e);
			return { type: 'fillSketch', ops: this.dashedLine(n, e) };
		}
		dashedLine(t, s) {
			const n =
					s.dashOffset < 0 ? (s.hachureGap < 0 ? 4 * s.strokeWidth : s.hachureGap) : s.dashOffset,
				a = s.dashGap < 0 ? (s.hachureGap < 0 ? 4 * s.strokeWidth : s.hachureGap) : s.dashGap,
				o = [];
			return (
				t.forEach((t) => {
					const h = e(t),
						r = Math.floor(h / (n + a)),
						i = (h + a - r * (n + a)) / 2;
					let c = t[0],
						l = t[1];
					c[0] > l[0] && ((c = t[1]), (l = t[0]));
					const u = Math.atan((l[1] - c[1]) / (l[0] - c[0]));
					for (let t = 0; t < r; t++) {
						const e = t * (n + a),
							h = e + n,
							r = [
								c[0] + e * Math.cos(u) + i * Math.cos(u),
								c[1] + e * Math.sin(u) + i * Math.sin(u)
							],
							l = [
								c[0] + h * Math.cos(u) + i * Math.cos(u),
								c[1] + h * Math.sin(u) + i * Math.sin(u)
							];
						o.push(...this.helper.doubleLineOps(r[0], r[1], l[0], l[1], s));
					}
				}),
				o
			);
		}
	}
	class i {
		constructor(t) {
			this.helper = t;
		}
		fillPolygons(t, e) {
			const n = e.hachureGap < 0 ? 4 * e.strokeWidth : e.hachureGap,
				a = e.zigzagOffset < 0 ? n : e.zigzagOffset,
				o = s(t, (e = Object.assign({}, e, { hachureGap: n + a })));
			return { type: 'fillSketch', ops: this.zigzagLines(o, a, e) };
		}
		zigzagLines(t, s, n) {
			const a = [];
			return (
				t.forEach((t) => {
					const o = e(t),
						h = Math.round(o / (2 * s));
					let r = t[0],
						i = t[1];
					r[0] > i[0] && ((r = t[1]), (i = t[0]));
					const c = Math.atan((i[1] - r[1]) / (i[0] - r[0]));
					for (let t = 0; t < h; t++) {
						const e = 2 * t * s,
							o = 2 * (t + 1) * s,
							h = Math.sqrt(2 * Math.pow(s, 2)),
							i = [r[0] + e * Math.cos(c), r[1] + e * Math.sin(c)],
							l = [r[0] + o * Math.cos(c), r[1] + o * Math.sin(c)],
							u = [i[0] + h * Math.cos(c + Math.PI / 4), i[1] + h * Math.sin(c + Math.PI / 4)];
						a.push(
							...this.helper.doubleLineOps(i[0], i[1], u[0], u[1], n),
							...this.helper.doubleLineOps(u[0], u[1], l[0], l[1], n)
						);
					}
				}),
				a
			);
		}
	}
	const c = {};
	class l {
		constructor(t) {
			this.seed = t;
		}
		next() {
			return this.seed
				? ((2 ** 31 - 1) & (this.seed = Math.imul(48271, this.seed))) / 2 ** 31
				: Math.random();
		}
	}
	const u = {
		A: 7,
		a: 7,
		C: 6,
		c: 6,
		H: 1,
		h: 1,
		L: 2,
		l: 2,
		M: 2,
		m: 2,
		Q: 4,
		q: 4,
		S: 4,
		s: 4,
		T: 2,
		t: 2,
		V: 1,
		v: 1,
		Z: 0,
		z: 0
	};
	function p(t, e) {
		return t.type === e;
	}
	function f(t) {
		const e = [],
			s = (function (t) {
				const e = new Array();
				for (; '' !== t; )
					if (t.match(/^([ \t\r\n,]+)/)) t = t.substr(RegExp.$1.length);
					else if (t.match(/^([aAcChHlLmMqQsStTvVzZ])/))
						(e[e.length] = { type: 0, text: RegExp.$1 }), (t = t.substr(RegExp.$1.length));
					else {
						if (!t.match(/^(([-+]?[0-9]+(\.[0-9]*)?|[-+]?\.[0-9]+)([eE][-+]?[0-9]+)?)/)) return [];
						(e[e.length] = { type: 1, text: `${parseFloat(RegExp.$1)}` }),
							(t = t.substr(RegExp.$1.length));
					}
				return (e[e.length] = { type: 2, text: '' }), e;
			})(t);
		let n = 'BOD',
			a = 0,
			o = s[a];
		for (; !p(o, 2); ) {
			let h = 0;
			const r = [];
			if ('BOD' === n) {
				if ('M' !== o.text && 'm' !== o.text) return f('M0,0' + t);
				a++, (h = u[o.text]), (n = o.text);
			} else p(o, 1) ? (h = u[n]) : (a++, (h = u[o.text]), (n = o.text));
			if (!(a + h < s.length)) throw new Error('Path data ended short');
			for (let t = a; t < a + h; t++) {
				const e = s[t];
				if (!p(e, 1)) throw new Error('Param not a number: ' + n + ',' + e.text);
				r[r.length] = +e.text;
			}
			if ('number' != typeof u[n]) throw new Error('Bad segment: ' + n);
			{
				const t = { key: n, data: r };
				e.push(t), (a += h), (o = s[a]), 'M' === n && (n = 'L'), 'm' === n && (n = 'l');
			}
		}
		return e;
	}
	function d(t) {
		let e = 0,
			s = 0,
			n = 0,
			a = 0;
		const o = [];
		for (const { key: h, data: r } of t)
			switch (h) {
				case 'M':
					o.push({ key: 'M', data: [...r] }), ([e, s] = r), ([n, a] = r);
					break;
				case 'm':
					(e += r[0]), (s += r[1]), o.push({ key: 'M', data: [e, s] }), (n = e), (a = s);
					break;
				case 'L':
					o.push({ key: 'L', data: [...r] }), ([e, s] = r);
					break;
				case 'l':
					(e += r[0]), (s += r[1]), o.push({ key: 'L', data: [e, s] });
					break;
				case 'C':
					o.push({ key: 'C', data: [...r] }), (e = r[4]), (s = r[5]);
					break;
				case 'c': {
					const t = r.map((t, n) => (n % 2 ? t + s : t + e));
					o.push({ key: 'C', data: t }), (e = t[4]), (s = t[5]);
					break;
				}
				case 'Q':
					o.push({ key: 'Q', data: [...r] }), (e = r[2]), (s = r[3]);
					break;
				case 'q': {
					const t = r.map((t, n) => (n % 2 ? t + s : t + e));
					o.push({ key: 'Q', data: t }), (e = t[2]), (s = t[3]);
					break;
				}
				case 'A':
					o.push({ key: 'A', data: [...r] }), (e = r[5]), (s = r[6]);
					break;
				case 'a':
					(e += r[5]),
						(s += r[6]),
						o.push({ key: 'A', data: [r[0], r[1], r[2], r[3], r[4], e, s] });
					break;
				case 'H':
					o.push({ key: 'H', data: [...r] }), (e = r[0]);
					break;
				case 'h':
					(e += r[0]), o.push({ key: 'H', data: [e] });
					break;
				case 'V':
					o.push({ key: 'V', data: [...r] }), (s = r[0]);
					break;
				case 'v':
					(s += r[0]), o.push({ key: 'V', data: [s] });
					break;
				case 'S':
					o.push({ key: 'S', data: [...r] }), (e = r[2]), (s = r[3]);
					break;
				case 's': {
					const t = r.map((t, n) => (n % 2 ? t + s : t + e));
					o.push({ key: 'S', data: t }), (e = t[2]), (s = t[3]);
					break;
				}
				case 'T':
					o.push({ key: 'T', data: [...r] }), (e = r[0]), (s = r[1]);
					break;
				case 't':
					(e += r[0]), (s += r[1]), o.push({ key: 'T', data: [e, s] });
					break;
				case 'Z':
				case 'z':
					o.push({ key: 'Z', data: [] }), (e = n), (s = a);
			}
		return o;
	}
	function g(t) {
		const e = [];
		let s = '',
			n = 0,
			a = 0,
			o = 0,
			h = 0,
			r = 0,
			i = 0;
		for (const { key: c, data: l } of t) {
			switch (c) {
				case 'M':
					e.push({ key: 'M', data: [...l] }), ([n, a] = l), ([o, h] = l);
					break;
				case 'C':
					e.push({ key: 'C', data: [...l] }), (n = l[4]), (a = l[5]), (r = l[2]), (i = l[3]);
					break;
				case 'L':
					e.push({ key: 'L', data: [...l] }), ([n, a] = l);
					break;
				case 'H':
					(n = l[0]), e.push({ key: 'L', data: [n, a] });
					break;
				case 'V':
					(a = l[0]), e.push({ key: 'L', data: [n, a] });
					break;
				case 'S': {
					let t = 0,
						o = 0;
					'C' === s || 'S' === s ? ((t = n + (n - r)), (o = a + (a - i))) : ((t = n), (o = a)),
						e.push({ key: 'C', data: [t, o, ...l] }),
						(r = l[0]),
						(i = l[1]),
						(n = l[2]),
						(a = l[3]);
					break;
				}
				case 'T': {
					const [t, o] = l;
					let h = 0,
						c = 0;
					'Q' === s || 'T' === s ? ((h = n + (n - r)), (c = a + (a - i))) : ((h = n), (c = a));
					const u = n + (2 * (h - n)) / 3,
						p = a + (2 * (c - a)) / 3,
						f = t + (2 * (h - t)) / 3,
						d = o + (2 * (c - o)) / 3;
					e.push({ key: 'C', data: [u, p, f, d, t, o] }), (r = h), (i = c), (n = t), (a = o);
					break;
				}
				case 'Q': {
					const [t, s, o, h] = l,
						c = n + (2 * (t - n)) / 3,
						u = a + (2 * (s - a)) / 3,
						p = o + (2 * (t - o)) / 3,
						f = h + (2 * (s - h)) / 3;
					e.push({ key: 'C', data: [c, u, p, f, o, h] }), (r = t), (i = s), (n = o), (a = h);
					break;
				}
				case 'A': {
					const t = Math.abs(l[0]),
						s = Math.abs(l[1]),
						o = l[2],
						h = l[3],
						r = l[4],
						i = l[5],
						c = l[6];
					if (0 === t || 0 === s) e.push({ key: 'C', data: [n, a, i, c, i, c] }), (n = i), (a = c);
					else if (n !== i || a !== c) {
						k(n, a, i, c, t, s, o, h, r).forEach(function (t) {
							e.push({ key: 'C', data: t });
						}),
							(n = i),
							(a = c);
					}
					break;
				}
				case 'Z':
					e.push({ key: 'Z', data: [] }), (n = o), (a = h);
			}
			s = c;
		}
		return e;
	}
	function M(t, e, s) {
		return [t * Math.cos(s) - e * Math.sin(s), t * Math.sin(s) + e * Math.cos(s)];
	}
	function k(t, e, s, n, a, o, h, r, i, c) {
		const l = ((u = h), (Math.PI * u) / 180);
		var u;
		let p = [],
			f = 0,
			d = 0,
			g = 0,
			b = 0;
		if (c) [f, d, g, b] = c;
		else {
			([t, e] = M(t, e, -l)), ([s, n] = M(s, n, -l));
			const h = (t - s) / 2,
				c = (e - n) / 2;
			let u = (h * h) / (a * a) + (c * c) / (o * o);
			u > 1 && ((u = Math.sqrt(u)), (a *= u), (o *= u));
			const p = a * a,
				k = o * o,
				y = p * k - p * c * c - k * h * h,
				m = p * c * c + k * h * h,
				w = (r === i ? -1 : 1) * Math.sqrt(Math.abs(y / m));
			(g = (w * a * c) / o + (t + s) / 2),
				(b = (w * -o * h) / a + (e + n) / 2),
				(f = Math.asin(parseFloat(((e - b) / o).toFixed(9)))),
				(d = Math.asin(parseFloat(((n - b) / o).toFixed(9)))),
				t < g && (f = Math.PI - f),
				s < g && (d = Math.PI - d),
				f < 0 && (f = 2 * Math.PI + f),
				d < 0 && (d = 2 * Math.PI + d),
				i && f > d && (f -= 2 * Math.PI),
				!i && d > f && (d -= 2 * Math.PI);
		}
		let y = d - f;
		if (Math.abs(y) > (120 * Math.PI) / 180) {
			const t = d,
				e = s,
				r = n;
			(d = i && d > f ? f + ((120 * Math.PI) / 180) * 1 : f + ((120 * Math.PI) / 180) * -1),
				(p = k((s = g + a * Math.cos(d)), (n = b + o * Math.sin(d)), e, r, a, o, h, 0, i, [
					d,
					t,
					g,
					b
				]));
		}
		y = d - f;
		const m = Math.cos(f),
			w = Math.sin(f),
			x = Math.cos(d),
			P = Math.sin(d),
			v = Math.tan(y / 4),
			O = (4 / 3) * a * v,
			S = (4 / 3) * o * v,
			L = [t, e],
			T = [t + O * w, e - S * m],
			D = [s + O * P, n - S * x],
			A = [s, n];
		if (((T[0] = 2 * L[0] - T[0]), (T[1] = 2 * L[1] - T[1]), c)) return [T, D, A].concat(p);
		{
			p = [T, D, A].concat(p);
			const t = [];
			for (let e = 0; e < p.length; e += 3) {
				const s = M(p[e][0], p[e][1], l),
					n = M(p[e + 1][0], p[e + 1][1], l),
					a = M(p[e + 2][0], p[e + 2][1], l);
				t.push([s[0], s[1], n[0], n[1], a[0], a[1]]);
			}
			return t;
		}
	}
	const b = {
		randOffset: function (t, e) {
			return A(t, e);
		},
		randOffsetWithRange: function (t, e, s) {
			return D(t, e, s);
		},
		ellipse: function (t, e, s, n, a) {
			const o = P(s, n, a);
			return v(t, e, a, o).opset;
		},
		doubleLineOps: function (t, e, s, n, a) {
			return I(t, e, s, n, a, !0);
		}
	};
	function y(t, e, s, n, a) {
		return { type: 'path', ops: I(t, e, s, n, a) };
	}
	function m(t, e, s) {
		const n = (t || []).length;
		if (n > 2) {
			const a = [];
			for (let e = 0; e < n - 1; e++) a.push(...I(t[e][0], t[e][1], t[e + 1][0], t[e + 1][1], s));
			return (
				e && a.push(...I(t[n - 1][0], t[n - 1][1], t[0][0], t[0][1], s)), { type: 'path', ops: a }
			);
		}
		return 2 === n ? y(t[0][0], t[0][1], t[1][0], t[1][1], s) : { type: 'path', ops: [] };
	}
	function w(t, e, s, n, a) {
		return (function (t, e) {
			return m(t, !0, e);
		})(
			[
				[t, e],
				[t + s, e],
				[t + s, e + n],
				[t, e + n]
			],
			a
		);
	}
	function x(t, e) {
		let s = _(t, 1 * (1 + 0.2 * e.roughness), e);
		if (!e.disableMultiStroke) {
			const n = _(
				t,
				1.5 * (1 + 0.22 * e.roughness),
				(function (t) {
					const e = Object.assign({}, t);
					(e.randomizer = void 0), t.seed && (e.seed = t.seed + 1);
					return e;
				})(e)
			);
			s = s.concat(n);
		}
		return { type: 'path', ops: s };
	}
	function P(t, e, s) {
		const n = Math.sqrt(2 * Math.PI * Math.sqrt((Math.pow(t / 2, 2) + Math.pow(e / 2, 2)) / 2)),
			a = Math.ceil(Math.max(s.curveStepCount, (s.curveStepCount / Math.sqrt(200)) * n)),
			o = (2 * Math.PI) / a;
		let h = Math.abs(t / 2),
			r = Math.abs(e / 2);
		const i = 1 - s.curveFitting;
		return (h += A(h * i, s)), (r += A(r * i, s)), { increment: o, rx: h, ry: r };
	}
	function v(t, e, s, n) {
		const [a, o] = z(n.increment, t, e, n.rx, n.ry, 1, n.increment * D(0.1, D(0.4, 1, s), s), s);
		let h = W(a, null, s);
		if (!s.disableMultiStroke && 0 !== s.roughness) {
			const [a] = z(n.increment, t, e, n.rx, n.ry, 1.5, 0, s),
				o = W(a, null, s);
			h = h.concat(o);
		}
		return { estimatedPoints: o, opset: { type: 'path', ops: h } };
	}
	function O(t, e, s, n, a, o, h, r, i) {
		const c = t,
			l = e;
		let u = Math.abs(s / 2),
			p = Math.abs(n / 2);
		(u += A(0.01 * u, i)), (p += A(0.01 * p, i));
		let f = a,
			d = o;
		for (; f < 0; ) (f += 2 * Math.PI), (d += 2 * Math.PI);
		d - f > 2 * Math.PI && ((f = 0), (d = 2 * Math.PI));
		const g = (2 * Math.PI) / i.curveStepCount,
			M = Math.min(g / 2, (d - f) / 2),
			k = E(M, c, l, u, p, f, d, 1, i);
		if (!i.disableMultiStroke) {
			const t = E(M, c, l, u, p, f, d, 1.5, i);
			k.push(...t);
		}
		return (
			h &&
				(r
					? k.push(
							...I(c, l, c + u * Math.cos(f), l + p * Math.sin(f), i),
							...I(c, l, c + u * Math.cos(d), l + p * Math.sin(d), i)
					  )
					: k.push(
							{ op: 'lineTo', data: [c, l] },
							{ op: 'lineTo', data: [c + u * Math.cos(f), l + p * Math.sin(f)] }
					  )),
			{ type: 'path', ops: k }
		);
	}
	function S(t, e) {
		const s = [];
		for (const n of t)
			if (n.length) {
				const t = e.maxRandomnessOffset || 0,
					a = n.length;
				if (a > 2) {
					s.push({ op: 'move', data: [n[0][0] + A(t, e), n[0][1] + A(t, e)] });
					for (let o = 1; o < a; o++)
						s.push({ op: 'lineTo', data: [n[o][0] + A(t, e), n[o][1] + A(t, e)] });
				}
			}
		return { type: 'fillPath', ops: s };
	}
	function L(t, e) {
		return (function (t, e) {
			let s = t.fillStyle || 'hachure';
			if (!c[s])
				switch (s) {
					case 'zigzag':
						c[s] || (c[s] = new a(e));
						break;
					case 'cross-hatch':
						c[s] || (c[s] = new o(e));
						break;
					case 'dots':
						c[s] || (c[s] = new h(e));
						break;
					case 'dashed':
						c[s] || (c[s] = new r(e));
						break;
					case 'zigzag-line':
						c[s] || (c[s] = new i(e));
						break;
					case 'hachure':
					default:
						(s = 'hachure'), c[s] || (c[s] = new n(e));
				}
			return c[s];
		})(e, b).fillPolygons(t, e);
	}
	function T(t) {
		return t.randomizer || (t.randomizer = new l(t.seed || 0)), t.randomizer.next();
	}
	function D(t, e, s, n = 1) {
		return s.roughness * n * (T(s) * (e - t) + t);
	}
	function A(t, e, s = 1) {
		return D(-t, t, e, s);
	}
	function I(t, e, s, n, a, o = !1) {
		const h = o ? a.disableMultiStrokeFill : a.disableMultiStroke,
			r = C(t, e, s, n, a, !0, !1);
		if (h) return r;
		const i = C(t, e, s, n, a, !0, !0);
		return r.concat(i);
	}
	function C(t, e, s, n, a, o, h) {
		const r = Math.pow(t - s, 2) + Math.pow(e - n, 2),
			i = Math.sqrt(r);
		let c = 1;
		c = i < 200 ? 1 : i > 500 ? 0.4 : -0.0016668 * i + 1.233334;
		let l = a.maxRandomnessOffset || 0;
		l * l * 100 > r && (l = i / 10);
		const u = l / 2,
			p = 0.2 + 0.2 * T(a);
		let f = (a.bowing * a.maxRandomnessOffset * (n - e)) / 200,
			d = (a.bowing * a.maxRandomnessOffset * (t - s)) / 200;
		(f = A(f, a, c)), (d = A(d, a, c));
		const g = [],
			M = () => A(u, a, c),
			k = () => A(l, a, c),
			b = a.preserveVertices;
		return (
			o &&
				(h
					? g.push({ op: 'move', data: [t + (b ? 0 : M()), e + (b ? 0 : M())] })
					: g.push({ op: 'move', data: [t + (b ? 0 : A(l, a, c)), e + (b ? 0 : A(l, a, c))] })),
			h
				? g.push({
						op: 'bcurveTo',
						data: [
							f + t + (s - t) * p + M(),
							d + e + (n - e) * p + M(),
							f + t + 2 * (s - t) * p + M(),
							d + e + 2 * (n - e) * p + M(),
							s + (b ? 0 : M()),
							n + (b ? 0 : M())
						]
				  })
				: g.push({
						op: 'bcurveTo',
						data: [
							f + t + (s - t) * p + k(),
							d + e + (n - e) * p + k(),
							f + t + 2 * (s - t) * p + k(),
							d + e + 2 * (n - e) * p + k(),
							s + (b ? 0 : k()),
							n + (b ? 0 : k())
						]
				  }),
			g
		);
	}
	function _(t, e, s) {
		const n = [];
		n.push([t[0][0] + A(e, s), t[0][1] + A(e, s)]), n.push([t[0][0] + A(e, s), t[0][1] + A(e, s)]);
		for (let a = 1; a < t.length; a++)
			n.push([t[a][0] + A(e, s), t[a][1] + A(e, s)]),
				a === t.length - 1 && n.push([t[a][0] + A(e, s), t[a][1] + A(e, s)]);
		return W(n, null, s);
	}
	function W(t, e, s) {
		const n = t.length,
			a = [];
		if (n > 3) {
			const o = [],
				h = 1 - s.curveTightness;
			a.push({ op: 'move', data: [t[1][0], t[1][1]] });
			for (let e = 1; e + 2 < n; e++) {
				const s = t[e];
				(o[0] = [s[0], s[1]]),
					(o[1] = [
						s[0] + (h * t[e + 1][0] - h * t[e - 1][0]) / 6,
						s[1] + (h * t[e + 1][1] - h * t[e - 1][1]) / 6
					]),
					(o[2] = [
						t[e + 1][0] + (h * t[e][0] - h * t[e + 2][0]) / 6,
						t[e + 1][1] + (h * t[e][1] - h * t[e + 2][1]) / 6
					]),
					(o[3] = [t[e + 1][0], t[e + 1][1]]),
					a.push({ op: 'bcurveTo', data: [o[1][0], o[1][1], o[2][0], o[2][1], o[3][0], o[3][1]] });
			}
			if (e && 2 === e.length) {
				const t = s.maxRandomnessOffset;
				a.push({ op: 'lineTo', data: [e[0] + A(t, s), e[1] + A(t, s)] });
			}
		} else
			3 === n
				? (a.push({ op: 'move', data: [t[1][0], t[1][1]] }),
				  a.push({ op: 'bcurveTo', data: [t[1][0], t[1][1], t[2][0], t[2][1], t[2][0], t[2][1]] }))
				: 2 === n && a.push(...I(t[0][0], t[0][1], t[1][0], t[1][1], s));
		return a;
	}
	function z(t, e, s, n, a, o, h, r) {
		const i = [],
			c = [];
		if (0 === r.roughness) {
			(t /= 4), c.push([e + n * Math.cos(-t), s + a * Math.sin(-t)]);
			for (let o = 0; o <= 2 * Math.PI; o += t) {
				const t = [e + n * Math.cos(o), s + a * Math.sin(o)];
				i.push(t), c.push(t);
			}
			c.push([e + n * Math.cos(0), s + a * Math.sin(0)]),
				c.push([e + n * Math.cos(t), s + a * Math.sin(t)]);
		} else {
			const l = A(0.5, r) - Math.PI / 2;
			c.push([A(o, r) + e + 0.9 * n * Math.cos(l - t), A(o, r) + s + 0.9 * a * Math.sin(l - t)]);
			const u = 2 * Math.PI + l - 0.01;
			for (let h = l; h < u; h += t) {
				const t = [A(o, r) + e + n * Math.cos(h), A(o, r) + s + a * Math.sin(h)];
				i.push(t), c.push(t);
			}
			c.push([
				A(o, r) + e + n * Math.cos(l + 2 * Math.PI + 0.5 * h),
				A(o, r) + s + a * Math.sin(l + 2 * Math.PI + 0.5 * h)
			]),
				c.push([
					A(o, r) + e + 0.98 * n * Math.cos(l + h),
					A(o, r) + s + 0.98 * a * Math.sin(l + h)
				]),
				c.push([
					A(o, r) + e + 0.9 * n * Math.cos(l + 0.5 * h),
					A(o, r) + s + 0.9 * a * Math.sin(l + 0.5 * h)
				]);
		}
		return [c, i];
	}
	function E(t, e, s, n, a, o, h, r, i) {
		const c = o + A(0.1, i),
			l = [];
		l.push([A(r, i) + e + 0.9 * n * Math.cos(c - t), A(r, i) + s + 0.9 * a * Math.sin(c - t)]);
		for (let o = c; o <= h; o += t)
			l.push([A(r, i) + e + n * Math.cos(o), A(r, i) + s + a * Math.sin(o)]);
		return (
			l.push([e + n * Math.cos(h), s + a * Math.sin(h)]),
			l.push([e + n * Math.cos(h), s + a * Math.sin(h)]),
			W(l, null, i)
		);
	}
	function $(t, e, s, n, a, o, h, r) {
		const i = [],
			c = [r.maxRandomnessOffset || 1, (r.maxRandomnessOffset || 1) + 0.3];
		let l = [0, 0];
		const u = r.disableMultiStroke ? 1 : 2,
			p = r.preserveVertices;
		for (let f = 0; f < u; f++)
			0 === f
				? i.push({ op: 'move', data: [h[0], h[1]] })
				: i.push({ op: 'move', data: [h[0] + (p ? 0 : A(c[0], r)), h[1] + (p ? 0 : A(c[0], r))] }),
				(l = p ? [a, o] : [a + A(c[f], r), o + A(c[f], r)]),
				i.push({
					op: 'bcurveTo',
					data: [t + A(c[f], r), e + A(c[f], r), s + A(c[f], r), n + A(c[f], r), l[0], l[1]]
				});
		return i;
	}
	function G(t) {
		return [...t];
	}
	function R(t, e) {
		return Math.pow(t[0] - e[0], 2) + Math.pow(t[1] - e[1], 2);
	}
	function q(t, e, s) {
		const n = R(e, s);
		if (0 === n) return R(t, e);
		let a = ((t[0] - e[0]) * (s[0] - e[0]) + (t[1] - e[1]) * (s[1] - e[1])) / n;
		return (a = Math.max(0, Math.min(1, a))), R(t, j(e, s, a));
	}
	function j(t, e, s) {
		return [t[0] + (e[0] - t[0]) * s, t[1] + (e[1] - t[1]) * s];
	}
	function F(t, e, s, n) {
		const a = n || [];
		if (
			(function (t, e) {
				const s = t[e + 0],
					n = t[e + 1],
					a = t[e + 2],
					o = t[e + 3];
				let h = 3 * n[0] - 2 * s[0] - o[0];
				h *= h;
				let r = 3 * n[1] - 2 * s[1] - o[1];
				r *= r;
				let i = 3 * a[0] - 2 * o[0] - s[0];
				i *= i;
				let c = 3 * a[1] - 2 * o[1] - s[1];
				return (c *= c), h < i && (h = i), r < c && (r = c), h + r;
			})(t, e) < s
		) {
			const s = t[e + 0];
			if (a.length) {
				((o = a[a.length - 1]), (h = s), Math.sqrt(R(o, h))) > 1 && a.push(s);
			} else a.push(s);
			a.push(t[e + 3]);
		} else {
			const n = 0.5,
				o = t[e + 0],
				h = t[e + 1],
				r = t[e + 2],
				i = t[e + 3],
				c = j(o, h, n),
				l = j(h, r, n),
				u = j(r, i, n),
				p = j(c, l, n),
				f = j(l, u, n),
				d = j(p, f, n);
			F([o, c, p, d], 0, s, a), F([d, f, u, i], 0, s, a);
		}
		var o, h;
		return a;
	}
	function V(t, e) {
		return Z(t, 0, t.length, e);
	}
	function Z(t, e, s, n, a) {
		const o = a || [],
			h = t[e],
			r = t[s - 1];
		let i = 0,
			c = 1;
		for (let n = e + 1; n < s - 1; ++n) {
			const e = q(t[n], h, r);
			e > i && ((i = e), (c = n));
		}
		return (
			Math.sqrt(i) > n
				? (Z(t, e, c + 1, n, o), Z(t, c, s, n, o))
				: (o.length || o.push(h), o.push(r)),
			o
		);
	}
	function Q(t, e = 0.15, s) {
		const n = [],
			a = (t.length - 1) / 3;
		for (let s = 0; s < a; s++) {
			F(t, 3 * s, e, n);
		}
		return s && s > 0 ? Z(n, 0, n.length, s) : n;
	}
	const H = 'none';
	class N {
		constructor(t) {
			(this.defaultOptions = {
				maxRandomnessOffset: 2,
				roughness: 1,
				bowing: 1,
				stroke: '#000',
				strokeWidth: 1,
				curveTightness: 0,
				curveFitting: 0.95,
				curveStepCount: 9,
				fillStyle: 'hachure',
				fillWeight: -1,
				hachureAngle: -41,
				hachureGap: -1,
				dashOffset: -1,
				dashGap: -1,
				zigzagOffset: -1,
				seed: 0,
				disableMultiStroke: !1,
				disableMultiStrokeFill: !1,
				preserveVertices: !1
			}),
				(this.config = t || {}),
				this.config.options && (this.defaultOptions = this._o(this.config.options));
		}
		static newSeed() {
			return Math.floor(Math.random() * 2 ** 31);
		}
		_o(t) {
			return t ? Object.assign({}, this.defaultOptions, t) : this.defaultOptions;
		}
		_d(t, e, s) {
			return { shape: t, sets: e || [], options: s || this.defaultOptions };
		}
		line(t, e, s, n, a) {
			const o = this._o(a);
			return this._d('line', [y(t, e, s, n, o)], o);
		}
		rectangle(t, e, s, n, a) {
			const o = this._o(a),
				h = [],
				r = w(t, e, s, n, o);
			if (o.fill) {
				const a = [
					[t, e],
					[t + s, e],
					[t + s, e + n],
					[t, e + n]
				];
				'solid' === o.fillStyle ? h.push(S([a], o)) : h.push(L([a], o));
			}
			return o.stroke !== H && h.push(r), this._d('rectangle', h, o);
		}
		ellipse(t, e, s, n, a) {
			const o = this._o(a),
				h = [],
				r = P(s, n, o),
				i = v(t, e, o, r);
			if (o.fill)
				if ('solid' === o.fillStyle) {
					const s = v(t, e, o, r).opset;
					(s.type = 'fillPath'), h.push(s);
				} else h.push(L([i.estimatedPoints], o));
			return o.stroke !== H && h.push(i.opset), this._d('ellipse', h, o);
		}
		circle(t, e, s, n) {
			const a = this.ellipse(t, e, s, s, n);
			return (a.shape = 'circle'), a;
		}
		linearPath(t, e) {
			const s = this._o(e);
			return this._d('linearPath', [m(t, !1, s)], s);
		}
		arc(t, e, s, n, a, o, h = !1, r) {
			const i = this._o(r),
				c = [],
				l = O(t, e, s, n, a, o, h, !0, i);
			if (h && i.fill)
				if ('solid' === i.fillStyle) {
					const h = Object.assign({}, i);
					h.disableMultiStroke = !0;
					const r = O(t, e, s, n, a, o, !0, !1, h);
					(r.type = 'fillPath'), c.push(r);
				} else
					c.push(
						(function (t, e, s, n, a, o, h) {
							const r = t,
								i = e;
							let c = Math.abs(s / 2),
								l = Math.abs(n / 2);
							(c += A(0.01 * c, h)), (l += A(0.01 * l, h));
							let u = a,
								p = o;
							for (; u < 0; ) (u += 2 * Math.PI), (p += 2 * Math.PI);
							p - u > 2 * Math.PI && ((u = 0), (p = 2 * Math.PI));
							const f = (p - u) / h.curveStepCount,
								d = [];
							for (let t = u; t <= p; t += f) d.push([r + c * Math.cos(t), i + l * Math.sin(t)]);
							return d.push([r + c * Math.cos(p), i + l * Math.sin(p)]), d.push([r, i]), L([d], h);
						})(t, e, s, n, a, o, i)
					);
			return i.stroke !== H && c.push(l), this._d('arc', c, i);
		}
		curve(t, e) {
			const s = this._o(e),
				n = [],
				a = x(t, s);
			if (s.fill && s.fill !== H && t.length >= 3) {
				const e = Q(
					(function (t, e = 0) {
						const s = t.length;
						if (s < 3) throw new Error('A curve must have at least three points.');
						const n = [];
						if (3 === s) n.push(G(t[0]), G(t[1]), G(t[2]), G(t[2]));
						else {
							const s = [];
							s.push(t[0], t[0]);
							for (let e = 1; e < t.length; e++) s.push(t[e]), e === t.length - 1 && s.push(t[e]);
							const a = [],
								o = 1 - e;
							n.push(G(s[0]));
							for (let t = 1; t + 2 < s.length; t++) {
								const e = s[t];
								(a[0] = [e[0], e[1]]),
									(a[1] = [
										e[0] + (o * s[t + 1][0] - o * s[t - 1][0]) / 6,
										e[1] + (o * s[t + 1][1] - o * s[t - 1][1]) / 6
									]),
									(a[2] = [
										s[t + 1][0] + (o * s[t][0] - o * s[t + 2][0]) / 6,
										s[t + 1][1] + (o * s[t][1] - o * s[t + 2][1]) / 6
									]),
									(a[3] = [s[t + 1][0], s[t + 1][1]]),
									n.push(a[1], a[2], a[3]);
							}
						}
						return n;
					})(t),
					10,
					(1 + s.roughness) / 2
				);
				'solid' === s.fillStyle ? n.push(S([e], s)) : n.push(L([e], s));
			}
			return s.stroke !== H && n.push(a), this._d('curve', n, s);
		}
		polygon(t, e) {
			const s = this._o(e),
				n = [],
				a = m(t, !0, s);
			return (
				s.fill && ('solid' === s.fillStyle ? n.push(S([t], s)) : n.push(L([t], s))),
				s.stroke !== H && n.push(a),
				this._d('polygon', n, s)
			);
		}
		path(t, e) {
			const s = this._o(e),
				n = [];
			if (!t) return this._d('path', n, s);
			t = (t || '').replace(/\n/g, ' ').replace(/(-\s)/g, '-').replace('/(ss)/g', ' ');
			const a = s.fill && 'transparent' !== s.fill && s.fill !== H,
				o = s.stroke !== H,
				h = !!(s.simplification && s.simplification < 1),
				r = (function (t, e, s) {
					const n = g(d(f(t))),
						a = [];
					let o = [],
						h = [0, 0],
						r = [];
					const i = () => {
							r.length >= 4 && o.push(...Q(r, e)), (r = []);
						},
						c = () => {
							i(), o.length && (a.push(o), (o = []));
						};
					for (const { key: t, data: e } of n)
						switch (t) {
							case 'M':
								c(), (h = [e[0], e[1]]), o.push(h);
								break;
							case 'L':
								i(), o.push([e[0], e[1]]);
								break;
							case 'C':
								if (!r.length) {
									const t = o.length ? o[o.length - 1] : h;
									r.push([t[0], t[1]]);
								}
								r.push([e[0], e[1]]), r.push([e[2], e[3]]), r.push([e[4], e[5]]);
								break;
							case 'Z':
								i(), o.push([h[0], h[1]]);
						}
					if ((c(), !s)) return a;
					const l = [];
					for (const t of a) {
						const e = V(t, s);
						e.length && l.push(e);
					}
					return l;
				})(t, 1, h ? 4 - 4 * s.simplification : (1 + s.roughness) / 2);
			return (
				a && ('solid' === s.fillStyle ? n.push(S(r, s)) : n.push(L(r, s))),
				o &&
					(h
						? r.forEach((t) => {
								n.push(m(t, !1, s));
						  })
						: n.push(
								(function (t, e) {
									const s = g(d(f(t))),
										n = [];
									let a = [0, 0],
										o = [0, 0];
									for (const { key: t, data: h } of s)
										switch (t) {
											case 'M': {
												const t = 1 * (e.maxRandomnessOffset || 0),
													s = e.preserveVertices;
												n.push({ op: 'move', data: h.map((n) => n + (s ? 0 : A(t, e))) }),
													(o = [h[0], h[1]]),
													(a = [h[0], h[1]]);
												break;
											}
											case 'L':
												n.push(...I(o[0], o[1], h[0], h[1], e)), (o = [h[0], h[1]]);
												break;
											case 'C': {
												const [t, s, a, r, i, c] = h;
												n.push(...$(t, s, a, r, i, c, o, e)), (o = [i, c]);
												break;
											}
											case 'Z':
												n.push(...I(o[0], o[1], a[0], a[1], e)), (o = [a[0], a[1]]);
										}
									return { type: 'path', ops: n };
								})(t, s)
						  )),
				this._d('path', n, s)
			);
		}
		opsToPath(t, e) {
			let s = '';
			for (const n of t.ops) {
				const t = 'number' == typeof e && e >= 0 ? n.data.map((t) => +t.toFixed(e)) : n.data;
				switch (n.op) {
					case 'move':
						s += `M${t[0]} ${t[1]} `;
						break;
					case 'bcurveTo':
						s += `C${t[0]} ${t[1]}, ${t[2]} ${t[3]}, ${t[4]} ${t[5]} `;
						break;
					case 'lineTo':
						s += `L${t[0]} ${t[1]} `;
				}
			}
			return s.trim();
		}
		toPaths(t) {
			const e = t.sets || [],
				s = t.options || this.defaultOptions,
				n = [];
			for (const t of e) {
				let e = null;
				switch (t.type) {
					case 'path':
						e = { d: this.opsToPath(t), stroke: s.stroke, strokeWidth: s.strokeWidth, fill: H };
						break;
					case 'fillPath':
						e = { d: this.opsToPath(t), stroke: H, strokeWidth: 0, fill: s.fill || H };
						break;
					case 'fillSketch':
						e = this.fillSketch(t, s);
				}
				e && n.push(e);
			}
			return n;
		}
		fillSketch(t, e) {
			let s = e.fillWeight;
			return (
				s < 0 && (s = e.strokeWidth / 2),
				{ d: this.opsToPath(t), stroke: e.fill || H, strokeWidth: s, fill: H }
			);
		}
	}
	class B {
		constructor(t, e) {
			(this.canvas = t), (this.ctx = this.canvas.getContext('2d')), (this.gen = new N(e));
		}
		draw(t) {
			const e = t.sets || [],
				s = t.options || this.getDefaultOptions(),
				n = this.ctx,
				a = t.options.fixedDecimalPlaceDigits;
			for (const o of e)
				switch (o.type) {
					case 'path':
						n.save(),
							(n.strokeStyle = 'none' === s.stroke ? 'transparent' : s.stroke),
							(n.lineWidth = s.strokeWidth),
							s.strokeLineDash && n.setLineDash(s.strokeLineDash),
							s.strokeLineDashOffset && (n.lineDashOffset = s.strokeLineDashOffset),
							this._drawToContext(n, o, a),
							n.restore();
						break;
					case 'fillPath': {
						n.save(), (n.fillStyle = s.fill || '');
						const e =
							'curve' === t.shape || 'polygon' === t.shape || 'path' === t.shape
								? 'evenodd'
								: 'nonzero';
						this._drawToContext(n, o, a, e), n.restore();
						break;
					}
					case 'fillSketch':
						this.fillSketch(n, o, s);
				}
		}
		fillSketch(t, e, s) {
			let n = s.fillWeight;
			n < 0 && (n = s.strokeWidth / 2),
				t.save(),
				s.fillLineDash && t.setLineDash(s.fillLineDash),
				s.fillLineDashOffset && (t.lineDashOffset = s.fillLineDashOffset),
				(t.strokeStyle = s.fill || ''),
				(t.lineWidth = n),
				this._drawToContext(t, e, s.fixedDecimalPlaceDigits),
				t.restore();
		}
		_drawToContext(t, e, s, n = 'nonzero') {
			t.beginPath();
			for (const n of e.ops) {
				const e = 'number' == typeof s && s >= 0 ? n.data.map((t) => +t.toFixed(s)) : n.data;
				switch (n.op) {
					case 'move':
						t.moveTo(e[0], e[1]);
						break;
					case 'bcurveTo':
						t.bezierCurveTo(e[0], e[1], e[2], e[3], e[4], e[5]);
						break;
					case 'lineTo':
						t.lineTo(e[0], e[1]);
				}
			}
			'fillPath' === e.type ? t.fill(n) : t.stroke();
		}
		get generator() {
			return this.gen;
		}
		getDefaultOptions() {
			return this.gen.defaultOptions;
		}
		line(t, e, s, n, a) {
			const o = this.gen.line(t, e, s, n, a);
			return this.draw(o), o;
		}
		rectangle(t, e, s, n, a) {
			const o = this.gen.rectangle(t, e, s, n, a);
			return this.draw(o), o;
		}
		ellipse(t, e, s, n, a) {
			const o = this.gen.ellipse(t, e, s, n, a);
			return this.draw(o), o;
		}
		circle(t, e, s, n) {
			const a = this.gen.circle(t, e, s, n);
			return this.draw(a), a;
		}
		linearPath(t, e) {
			const s = this.gen.linearPath(t, e);
			return this.draw(s), s;
		}
		polygon(t, e) {
			const s = this.gen.polygon(t, e);
			return this.draw(s), s;
		}
		arc(t, e, s, n, a, o, h = !1, r) {
			const i = this.gen.arc(t, e, s, n, a, o, h, r);
			return this.draw(i), i;
		}
		curve(t, e) {
			const s = this.gen.curve(t, e);
			return this.draw(s), s;
		}
		path(t, e) {
			const s = this.gen.path(t, e);
			return this.draw(s), s;
		}
	}
	const J = 'http://www.w3.org/2000/svg';
	class K {
		constructor(t, e) {
			(this.svg = t), (this.gen = new N(e));
		}
		draw(t) {
			const e = t.sets || [],
				s = t.options || this.getDefaultOptions(),
				n = this.svg.ownerDocument || window.document,
				a = n.createElementNS(J, 'g'),
				o = t.options.fixedDecimalPlaceDigits;
			for (const h of e) {
				let e = null;
				switch (h.type) {
					case 'path':
						(e = n.createElementNS(J, 'path')),
							e.setAttribute('d', this.opsToPath(h, o)),
							e.setAttribute('stroke', s.stroke),
							e.setAttribute('stroke-width', s.strokeWidth + ''),
							e.setAttribute('fill', 'none'),
							s.strokeLineDash &&
								e.setAttribute('stroke-dasharray', s.strokeLineDash.join(' ').trim()),
							s.strokeLineDashOffset &&
								e.setAttribute('stroke-dashoffset', `${s.strokeLineDashOffset}`);
						break;
					case 'fillPath':
						(e = n.createElementNS(J, 'path')),
							e.setAttribute('d', this.opsToPath(h, o)),
							e.setAttribute('stroke', 'none'),
							e.setAttribute('stroke-width', '0'),
							e.setAttribute('fill', s.fill || ''),
							('curve' !== t.shape && 'polygon' !== t.shape) ||
								e.setAttribute('fill-rule', 'evenodd');
						break;
					case 'fillSketch':
						e = this.fillSketch(n, h, s);
				}
				e && a.appendChild(e);
			}
			return a;
		}
		fillSketch(t, e, s) {
			let n = s.fillWeight;
			n < 0 && (n = s.strokeWidth / 2);
			const a = t.createElementNS(J, 'path');
			return (
				a.setAttribute('d', this.opsToPath(e, s.fixedDecimalPlaceDigits)),
				a.setAttribute('stroke', s.fill || ''),
				a.setAttribute('stroke-width', n + ''),
				a.setAttribute('fill', 'none'),
				s.fillLineDash && a.setAttribute('stroke-dasharray', s.fillLineDash.join(' ').trim()),
				s.fillLineDashOffset && a.setAttribute('stroke-dashoffset', `${s.fillLineDashOffset}`),
				a
			);
		}
		get generator() {
			return this.gen;
		}
		getDefaultOptions() {
			return this.gen.defaultOptions;
		}
		opsToPath(t, e) {
			return this.gen.opsToPath(t, e);
		}
		line(t, e, s, n, a) {
			const o = this.gen.line(t, e, s, n, a);
			return this.draw(o);
		}
		rectangle(t, e, s, n, a) {
			const o = this.gen.rectangle(t, e, s, n, a);
			return this.draw(o);
		}
		ellipse(t, e, s, n, a) {
			const o = this.gen.ellipse(t, e, s, n, a);
			return this.draw(o);
		}
		circle(t, e, s, n) {
			const a = this.gen.circle(t, e, s, n);
			return this.draw(a);
		}
		linearPath(t, e) {
			const s = this.gen.linearPath(t, e);
			return this.draw(s);
		}
		polygon(t, e) {
			const s = this.gen.polygon(t, e);
			return this.draw(s);
		}
		arc(t, e, s, n, a, o, h = !1, r) {
			const i = this.gen.arc(t, e, s, n, a, o, h, r);
			return this.draw(i);
		}
		curve(t, e) {
			const s = this.gen.curve(t, e);
			return this.draw(s);
		}
		path(t, e) {
			const s = this.gen.path(t, e);
			return this.draw(s);
		}
	}
	return {
		canvas: (t, e) => new B(t, e),
		svg: (t, e) => new K(t, e),
		generator: (t) => new N(t),
		newSeed: () => N.newSeed()
	};
})();
