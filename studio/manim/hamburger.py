from manim import DOWN, LEFT, UP, WHITE, Rectangle, Scene, VGroup, config

config.background_color = "#272727"


class HamburgerToX(Scene):
    """The hamburger button morphing into a close icon and back."""

    def construct(self):
        def bar():
            return Rectangle(width=2.5, height=0.3, color=WHITE, fill_opacity=1, stroke_width=0)

        top, mid, bot = bar().shift(UP * 0.8), bar(), bar().shift(DOWN * 0.8)
        burger = VGroup(top, mid, bot)
        self.add(burger)
        self.wait(0.5)

        self.play(
            mid.animate.shift(LEFT * 2.5).set_opacity(0),
            top.animate.move_to([0, 0, 0]).rotate(0.785),
            bot.animate.move_to([0, 0, 0]).rotate(-0.785),
            run_time=0.8,
        )
        self.wait(0.6)
        self.play(
            mid.animate.shift(-LEFT * 2.5).set_opacity(1),
            top.animate.rotate(-0.785).move_to(UP * 0.8),
            bot.animate.rotate(0.785).move_to(DOWN * 0.8),
            run_time=0.8,
        )
        self.wait(0.5)
