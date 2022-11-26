---
title: GUI 编程
date: 2022-05-21 00:00:00
type:
comments:
tags: 
  - GUI
  - Java 界面
categories: 
  - Java 开发
description: 
keywords: GUI
cover: https://w.wallhaven.cc/full/72/wallhaven-72drx3.jpg
top_img: https://w.wallhaven.cc/full/72/wallhaven-72drx3.jpg

---

​	GUI 编程是指图形界面编程(实际上此种技术已经淘汰，但是对`SpringMVC 的 "监听机制"`理解具有一定的帮助)。核心技术主要包括 AWT 界面编程、Swing 编程，但是这两种技术由于界面不美观同时还需要 jre 环境被淘汰。

# AWT

AWT 是 Swing 的前身，是抽象的窗口工具。

1）包含类和接口，位于 java.awt 包。

2）元素：是由众多组件 component 构成。

- 容器（Container）
  - 窗口（windows）
    - 窗口（Frame）：重点
    - 弹窗（Dialog）
  - 面板（Panel）：Applet

- 其他内嵌组件：按钮（Button）、文本域（TextArea）等

## Frame 初识

```java
public class TestFrame2 {
    public static void main(String[] args) {
        MyFrame myFrame1=new MyFrame(100,100,200,200,Color.blue);
        MyFrame myFrame2=new MyFrame(300,100,200,200,Color.yellow);
        MyFrame myFrame3=new MyFrame(100,300,200,200,Color.red);
        MyFrame myFrame4=new MyFrame(300,300,200,200,Color.MAGENTA);
    }
}
//由于需要对 Frame 进行一些特别的处理，因此采用继承，创建自己的特殊 Frame 类
class MyFrame extends Frame{
    static int id=0;	//可能存在多个窗口，我们需要一个计数器
    public MyFrame(int x,int y,int w,int h,Color color){
        super("Myframe+"+(++id));   //设置窗口名称
        setBackground(color);   //设置窗口背景色
        setBounds(x,y,w,h);   //设置窗口的位置以及大小（必须设定）
        setVisible(true);   //设置窗口可见（必须设定）

    }
}
```

但是发现一个问题：窗口点击右上角的 × ，仍然是关不掉的？ ====> 由于没有设定监听事件。

## Panel 面板

1、Panel 面板可以看作是单独的一块空间，但是不能单独存在，必须设置到 Frame 里面才可使用。

2、面板的布局是相对于Frame的位置。

> 窗口关闭事件：监听窗口，来结束程序。` addWindowListener()` 函数
>
> 使用适配器模式，避免重写所有方法。

```java
public class TestPanel {
    public static void main(String[] args) {
        Frame frame=new Frame();
        //布局的概念
        Panel panel=new Panel();
        //设置布局 null
        frame.setLayout(null);
        //坐标
        frame.setBounds(300,300,500,500);
        frame.setBackground(new Color(40,161,35));
        //panel设置坐标，相对于frame
        panel.setBounds(50,50,400,400);
        panel.setBackground(new Color(193,15,60));
        //frame.add(panel)
        frame.add(panel);
        frame.setVisible(true);
        //监听事件，监听窗口关闭事件  System.exit(0)
        //适配器模式
        frame.addWindowListener(new WindowAdapter() {
            //窗口点击关闭时需要做的事情
            @Override
            public void windowClosing(WindowEvent e) {
                //结束程序
               // super.windowClosing(e);
                System.exit(0);
            }
        });
    }
}
```

# 布局管理器

Frame 和 Panel 可以设置布局，布局是针对于容器来说的。

## 流式布局

```java
public class TestFlowLayout {
    public static void main(String[] args) {
        Frame frame=new Frame();
        //组件-按钮
        Button botton1=new Button("botton1");
        Button botton2=new Button("botton2");
        Button botton3=new Button("botton3");
        //设置为流式布局
	    //frame.setLayout(new FlowLayout());
        // frame.setLayout(new FlowLayout(FlowLayout.LEFT));
        frame.setLayout(new FlowLayout(FlowLayout.RIGHT));
        frame.setSize(200,200);
        //把按钮添加进去
        frame.add(botton1);
        frame.add(botton2);
        frame.add(botton3);
        frame.setVisible(true);
    }
}
```

default：center，可选项：left、center、right。

## 东西南北中

Frame 进行 add 组件元素（此处的元素可以是面板 Panel）的时候直接传入布局的参数，分为东、西、南、北、中。

```java
public class TestBorderLayout {
    public static void main(String[] args) {
        Frame frame=new Frame("TestBorderLayout");
        Button east=new Button("East");
        Button west=new Button("West");
        Button south=new Button("South");
        Button north=new Button("North");
        
        frame.add(east,BorderLayout.EAST);
        frame.add(west,BorderLayout.WEST);
        frame.add(south,BorderLayout.SOUTH);
        frame.add(north,BorderLayout.NORTH);
        
        frame.setSize(200,200);
        frame.setVisible(true);
    }
}
```

## 表格布局

```java
public class TestGridLayout {
    public static void main(String[] args) {
        Frame frame=new Frame("TestGridLayout");
        Button btn1=new Button("btn1");
        Button btn2=new Button("btn2");
        Button btn3=new Button("btn3");
        Button btn4=new Button("btn4");
        Button btn5=new Button("btn5");
        Button btn6=new Button("btn6");

        //设置 3 行 2 列 表格布局
        frame.setLayout(new GridLayout(3,2));

        frame.add(btn1);
        frame.add(btn2);
        frame.add(btn3);
        frame.add(btn4);
        frame.add(btn5);
        frame.add(btn6);

        frame.pack();//java函数
        frame.setVisible(true);
    }
}
```

## 布局练习

```java
public class ExDemo {
    public static void main(String[] args) {
        //总Frame
        Frame frame=new Frame();
        frame.setSize(400,300);
        frame.setLocation(300,400);
        frame.setBackground(Color.BLACK);
        frame.setVisible(true);

        frame.setLayout(new GridLayout(2,1));

        //4个面板
        Panel p1=new Panel(new BorderLayout() );
        Panel p2=new Panel(new GridLayout(2,1));
        Panel p3=new Panel(new BorderLayout());
        Panel p4=new Panel(new GridLayout(2,2));

        p1.add(new Button("East-1"),BorderLayout.EAST);
        p1.add(new Button("West-1"),BorderLayout.WEST);
        p2.add(new Button("p2-btn-1"));
        p2.add(new Button("p2-btn-2"));
        p1.add(p2,BorderLayout.CENTER);

        //下面
        p3.add(new Button("East-2"),BorderLayout.EAST);
        p3.add(new Button("West-2"),BorderLayout.WEST);
        //中间4个
        for (int i = 0; i < 4; i++) {
            p4.add(new Button("for-"+i));
        }
        p3.add(p4,BorderLayout.CENTER);
        frame.add(p1);
        frame.add(p3);

        frame.addWindowListener(new WindowAdapter(){
            @Override
                    public void windowClosing(WindowEvent e){
                System.exit(0);
            }
        });
    }
}
```

# 事件监听

监听：当某个事件发生时，会触发什么操作、或输出什么字符串。

## 按钮监听

```java
public class TestActionListener {
    public static void main(String[] args) {
        //按下按钮，触发一些事件
        Frame frame = new Frame();
        Button button = new Button();
        //因为addActionListener（）需要一个 ActionListener，所有我们需要构造一个ActionListener
        MyActionListener myActionListener = new MyActionListener();
        button.addActionListener(myActionListener);

        frame.add(button, BorderLayout.CENTER);
        frame.pack();

        windowClose(frame);//关闭窗口
        frame.setVisible(true);
    }
    //关闭窗口事件
    private static void windowClose(Frame frame){
        frame.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                System.exit(0);
            }
        });
    }
}
//事件监听
class MyActionListener implements ActionListener{
    @Override
    public void actionPerformed(ActionEvent e){
        System.out.println("aaa");
    }
}
```

同一个 监听事件 对象，对两个组件进行监听：`ActionListener`

```java
public class TestActionTwo {
    public static void main(String[] args) {
        //两个按钮，实现同一个监听
        //开始  停止
        Frame frame = new Frame("开始-停止");
        Button button1 = new Button("start");
        Button button2 = new Button("stop");

        //可以显示的定义按钮触发会返回的命令，如果不显示定义。则会走默认的值！
        //可以多个按钮只写一个监听类，通过在监听类中对所获取的按钮信息进行判断，并进行相应的操作（关闭等）
        button2.setActionCommand("button2-stop");

        MyMonitor myMonitor = new MyMonitor();

        button1.addActionListener(myMonitor);
        button2.addActionListener(myMonitor);

        frame.add(button1,BorderLayout.NORTH);
        frame.add(button1,BorderLayout.SOUTH);

        frame.pack();
        frame.setVisible(true);

    }
}
class MyMonitor implements ActionListener {
    @Override
    public void actionPerformed(ActionEvent e) {
        //e.getActionCommand()获取按钮的信息
        System.out.println("按钮被点击了：msg" + e.getActionCommand());
        if (e.getActionCommand().equals("start")) {
            ..........
        }else {
            ..........
        }
    }
}
```

## 文本框监听

```java
public class TestText01 {
    public static void main(String[] args) {
        //启动！
        new MyFrame();
    }
}
//这里继承了Frame，我们在面向对象的时候学过，new对象的时候会调用父类的构造方法，从而创建了一个Frame，并加载了Frame的属性和方法，因此，下面用的add(), setvisible()等方法都是Frame继承过来的。
class MyFrame extends Frame{
    public MyFrame(){
        TextField textField=new TextField();
        add(textField);

        //监听这个文本框输入的文字
        MyActionListener2 myActionListener2=new MyActionListener2();
        //按下enter，就会触发这个输入框的事件，类似于qq数日后按enter发送
        textField.addActionListener(myActionListener2);

        //设置替换编码
        textField.setEchoChar('*');

        setVisible(true);
        pack();


        //监听
    }
}
class MyActionListener2 implements ActionListener{
    //回车事件
    @Override
    public void actionPerformed(ActionEvent e){
       TextField field=(TextField) e.getSource();//获取一些资源,返回一个对象
        System.out.println(field.getText());//获得输入框的文本
        //将文本框清空。
        //这里为什么能够在这里修改文本框的内容？是因为getSource()返回的是文本框事件本身
        field.setText("");//null
    }
}
```

## 计算器案例

​		此处需要提出一种思想：组合。区别于直接继承，而是把类作为成员放入自己的类：

```java
class A extends B{
    
}
class A{
    public B b
}
```

<span style="color:pink">OOP原则：组合大于继承</span>

1、面向过程的写法：

```java
//简易计算器
public class TestCalc {
    public static void main(String[] args) {
        new Calculator();
    }
}
//计算器类
class Calculator extends Frame{
    //构造函数时直接定义
    public Calculator(){
        //三个文本框作为数字的输入和输出
        TextField num1=new TextField(10);//字符数
        TextField num2=new TextField(10);
        TextField num3=new TextField(20);

        //1个按钮
        Button button=new Button("=");
        //监听按钮：采用面向过程的方式进行参数的传递。
        button.addActionListener(new MyCalculatorListener(num1,num2,num3));
        //1个标签
        Label label=new Label("+");
        //布局
        setLayout(new FlowLayout());

        add(num1);
        add(label);
        add(num2);
        add(button);
        add(num3);

        pack();
        setVisible(true);

    }
}
//监听器类
class MyCalculatorListener implements ActionListener{
    //获取三个变量
    private TextField num1,num2,num3;
    public MyCalculatorListener(TextField num1,TextField num2,TextField num3){
        this.num1=num1;
        this.num2=num2;
        this.num3=num3;
    }
    @Override
    public void actionPerformed(ActionEvent e){
        //1:获得加数和被加数
        int n1=Integer.parseInt(num1.getText());
        int n2=Integer.parseInt(num2.getText());

        //2.将这个值+法运输后，放到第三个框
        num3.setText(""+(n1+n2));
        //3:清除前两个框
        num1.setText("");
        num2.setText("");
    }
}
```

2、组合的写法：

```java
public class TestCalc {
    public static void main(String[] args) {
        new Calculator().loadFrame();
    }
}

//加法计算器类
class Calculator extends Frame {

    TextField num1,num2,num3;

    public void loadFrame(){

        num1 = new TextField(10);
        num2 = new TextField(10);
        num3 = new TextField(20);
        Button button = new Button("=");
        Label label = new Label("+");

        button.addActionListener(new MyCalculatorListen(this));

        setLayout(new FlowLayout());

        add(num1);
        add(label);
        add(num2);
        add(button);
        add(num3);

        setVisible(true);
        pack();
    }
}

//监听器类
class MyCalculatorListen implements ActionListener{

    //在一个类中组合另外一个类
    private Calculator calculator;

    public MyCalculatorListen(Calculator calculator){
        this.calculator = calculator;
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        //获得两个加数
        int n1 = Integer.parseInt(calculator.num1.getText());
        int n2 = Integer.parseInt(calculator.num2.getText());

        //加法运算后，将结果放到第三个框
        calculator.num3.setText((n1 + n2) + "");

        //清除前两个框
        calculator.num1.setText("");
        calculator.num2.setText("");
    }
}
```

3、面向对象的写法：直接使用内部类方式，不需要单独引入其他类，而可以直接使用外部类的属性和方法。

```java
public class TestCalc {
    public static void main(String[] args) {
        new Calculator().loadFrame();
    }
}

//加法计算器类
class Calculator extends Frame {

    TextField num1,num2,num3;

    public void loadFrame(){

        num1 = new TextField(10);
        num2 = new TextField(10);
        num3 = new TextField(20);
        Button button = new Button("=");
        Label label = new Label("+");

        button.addActionListener(new MyCalculatorListen());

        setLayout(new FlowLayout());

        add(num1);
        add(label);
        add(num2);
        add(button);
        add(num3);

        setVisible(true);
        pack();

    }

    //内部类：监听器类
    private class MyCalculatorListen implements ActionListener{

        @Override
        public void actionPerformed(ActionEvent e) {
            //获得两个加数
            int n1 = Integer.parseInt(num1.getText());
            int n2 = Integer.parseInt(num2.getText());

            //加法运算后，将结果放到第三个框
            num3.setText((n1 + n2) + "");

            //清除前两个框
            num1.setText("");
            num2.setText("");
        }
    }
}
```

# 画笔

​		画笔相当于画图工具的🖊，就是对面板上进行点缀，绘制一些特殊的图案。

只需要重写 paint() 方法就会自动执行，不需要手动调用。

```java
public class TestPaint {
    public static void main(String[] args) {
        new MyPaint().loadFrame();
    }
}
class MyPaint extends Frame{
   
    public void loadFrame(){
        setBounds(200,200,600,500);
        setVisible(true);
    }
    
    //画笔
    @Override
    public void paint(Graphics g) {
        //画笔，需要有颜色，画笔可以画画
        //g.setColor(Color.red);
        //g.drawOval(100, 100, 100, 100);
        g.fillOval(100,100,100,100);
        //g.setColor(Color.GREEN);
        g.fillOval(150,200,200,200);
        //养成习惯，画笔用完，将它还原成最初的颜色
    }
}

```

# 鼠标监听

目的：实现鼠标画画，简单点击鼠标一下，出现一个点。

```java
//鼠标监听事件
public class TestMouseListener {
    public static void main(String[] args) {
        new MyFrame("画图");
    }
}

//自己的类
class MyFrame extends Frame {
    //画画需要画笔，需要监听鼠标当前的位置，需要集合来储存当前鼠标位置，用来后续画点
    ArrayList points;

    public MyFrame(String title) {
        super(title);
        setBounds(200, 200, 400, 300);
        //存鼠标点击的点
        points = new ArrayList<>();

        setVisible(true);
        //鼠标监听器，正对这个窗口
        this.addMouseListener(new MyMouseListener());
    }

    @Override
    public void paint(Graphics g) {
        //画画，监听鼠标的事件
        Iterator iterator = points.iterator();
        while (iterator.hasNext()) {
            Point point = (Point) iterator.next();
            g.setColor(Color.BLUE);
            g.fillOval(point.x, point.y, 10, 10);
        }
    }
    //添加一个点到界面上
    public void addPaint(Point point) {
        points.add(point);
    }
    //适配器模式：避免重写所有方法
    private class MyMouseListener extends MouseAdapter{
        //鼠标，按下、弹起、按住不放
        @Override
        public void mousePressed(MouseEvent e){
            MyFrame frame=(MyFrame) e.getSource();
            //e 就是鼠标对象，这个在我们点击的时候，就很难再界面上产生一个点！画
            //这个点就是鼠标的点
            frame.addPaint(new Point(e.getX(),e.getY()));
            //每次点击鼠标，都需要重新画一遍
            frame.repaint();//刷新
        }
    }
}
```

# 窗口监听

```java
public class TestWindow {
    public static void main(String[] args) {
        new WindowFrame();
    }
}
class WindowFrame extends Frame {
    public WindowFrame() {
        setBackground(Color.blue);
        setBounds(100, 100, 200, 200);
        setVisible(true);
        //addWindowListener(new MyWindowListener());
        this.addWindowListener(
                //匿名内部类
                new WindowAdapter() {
                    //关闭窗口
                    @Override
                    public void windowClosing(WindowEvent e) {
                        System.out.println("WindowClosing");
                        System.exit(0);
                    }

                    //激活窗口
                    @Override
                    public void windowActivated(WindowEvent e) {
                        WindowFrame source=(WindowFrame) e.getSource();
                        source.setTitle("被激活了");
                        System.out.println("windowActivated");
                    }
                }
        );
    }
}
```

# 键盘监听

```java
public class TestKeyListener {
    public static void main(String[] args) {
        new KeyFrame();
    }
}
class KeyFrame extends Frame{
    public KeyFrame(){
        setBounds(1,2,300,400);
        setVisible(true);
        this.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                //获取键盘下的键是哪一个，当前的码
                int KeyCode=e.getKeyCode();//不需要去记录这个数值，直接使用静态属性VK_XXX
                System.out.println(KeyCode);
                if (KeyCode==KeyEvent.VK_UP){
                    System.out.println("你按下了上键");
                }
                //根据按下的不同操作，产生不同的结果
            }
        });
    }
}
```

# Swing

Swing 是 AWT 的改进和加强技术，但是 Swing 技术实际上也被淘汰了。

## JFrame 

Swing 使用 JFrame 作为窗体。

```java
public class JframeDemo02 {
    public static void main(String[] args) {
        new MyJframe2().init();
    }
}
class MyJframe2 extends JFrame{
    public void init(){
        this.setBounds(10,20,200,300);
        this.setVisible(true);

        JLabel label=new JLabel("学习 Swing 技术");
        this.add(label);

        //让文本标签居中 设置水平对齐
        label.setHorizontalAlignment(SwingConstants.CENTER);
        //获得一个容器
        Container container=this.getContentPane();
        container.setBackground(Color.BLUE);
    }
}
```

## JDialog 弹窗

注意：JDialog 默认就有关闭时间，不需要重新定义。

```java
public class DialogDemo extends JFrame {
    public static void main(String[] args) {
        new DialogDemo();

    }
    
    public DialogDemo() {
        this.setVisible(true);
        this.setSize(700, 500);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);	//设置默认关闭容器
        //JFrame放东西，容器
        Container container = this.getContentPane();
        //绝对布局
        container.setLayout(null);
        //按钮
        JButton button = new JButton("点击弹出一个对话框");//创建
        button.setBounds(30, 30, 200, 50);
        //点击这个按钮的时候，弹出一个弹窗
        button.addActionListener(new ActionListener() {//监听器
            @Override
            public void actionPerformed(ActionEvent e) {
                // 初始化弹窗
                new MyDialogDemo();
            }
        });
        container.add(button);
    }
}

//弹窗的窗口：是一个新类，继承 JDialog ，表示是一个弹窗
class MyDialogDemo extends JDialog{
    
    public MyDialogDemo(){
        this.setVisible(true);
        this.setBounds(100,100,500,500);
        // 弹窗默认有这个关闭操作
        //this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);

        Container container=this.getContentPane();
        container.setLayout(null);

        container.add(new Label("java内容挺多呀!"));
    }
}
```

## 标签

label

```java
new JLabel("xxx");
```

图标：ICON

```java
public class ImageIconDemo extends JFrame {
    public ImageIconDemo(){
    	//获取图片地址
        JLabel label=new JLabel("ImageIcon");
        //ImageIconDemo.class.getResource 获取和类 ImageIconDemo 同级的资源
        URL url = ImageIconDemo.class.getResource("tx.jpg");

        ImageIcon imageIcon = new ImageIcon(url);
        label.setIcon(imageIcon);
        //居中显示
        label.setHorizontalAlignment(SwingConstants.CENTER);

        Container container = getContentPane();
        container.add(label);

        setVisible(true);

        setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        setBounds(100,100,200,200);
	}

    public static void main(String[] args) {
        new ImageIconDemo();
    }

}
```

## 面板

```java
public class JPanelDemo extends JFrame {
    public JPanelDemo() {
        Container container = this.getContentPane();
        container.setLayout(new GridLayout(2, 1, 10, 10));//后面的参数的意思，间距‘

        JPanel panel1 = new JPanel(new GridLayout(1, 3));
        JPanel panel2 = new JPanel(new GridLayout(1, 2));
        JPanel panel3 = new JPanel(new GridLayout(2, 1));
        JPanel panel4 = new JPanel(new GridLayout(3, 2));

        panel1.add(new JButton("1"));
        panel1.add(new JButton("1"));
        panel1.add(new JButton("1"));
        panel2.add(new JButton("2"));
        panel3.add(new JButton("2"));
        panel3.add(new JButton("3"));
        panel4.add(new JButton("3"));
        panel4.add(new JButton("4"));
        panel4.add(new JButton("4"));
        panel4.add(new JButton("4"));
        panel4.add(new JButton("4"));
        panel4.add(new JButton("4"));
        panel4.add(new JButton("4"));

        container.add(panel1);
        container.add(panel2);
        container.add(panel3);
        container.add(panel4);

        this.setVisible(true);
        this.setSize(500, 500);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        new JPanelDemo();
    }
}
```

滚动条Jpanel：

```java
public class JScrollDemo extends JFrame {
    public JScrollDemo() {
        Container container = this.getContentPane();
        //文本域
        JTextArea textArea = new JTextArea(20, 50);
        textArea.setText("欢迎学习java"); //默认文本

        //Scroll面板,需要 JScrollPane 才能设置滚动条
        JScrollPane scrollPane = new JScrollPane(textArea);
        container.add(scrollPane);

        this.setVisible(true);
        this.setBounds(100, 100, 200, 350);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        new JScrollDemo();
    }
}
```

## 图片按钮

```java
public class JButtonDemo01 extends JFrame {
    public JButtonDemo01() {
        Container container = this.getContentPane();
        //将一个图片变成图标
        URL resource = JButtonDemo01.class.getResource("tx.jpg");
        Icon icon = new ImageIcon(resource);
        //把这个图标放在按钮上
        JButton button = new JButton();
        button.setIcon(icon);
        button.setToolTipText("图片按钮");

        //add
        container.add(button);
        this.setVisible(true);
        this.setSize(500, 300);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        new JButtonDemo01();
    }
}
```

## 单选框

```jAVA
public class JButtonDemo01 extends JFrame {
    public JButtonDemo01() {
        Container container = this.getContentPane();
        //将一个图片变成图标
        UPL resource = JButtonDemo01.class.getResource("tx.jpg");
        Icon icon = new ImageIcon(resource);
        //单选框
        JRadioButton radioButton1=new JRadioButton("JRadioButton01");
        JRadioButton radioButton2=new JRadioButton("JRadioButton01");
        JRadioButton radioButton3=new JRadioButton("JRadioButton01");
        //由于单选框只能选择一个，分组，一个组中只能选择一个
        ButtonGroup group = new ButtonGroup();
        group.add(radioButton1);
        group.add(radioButton2);
        group.add(radioButton3);

        container.add(radioButton1,BorderLayout.CENTER);
        container.add(radioButton2,BorderLayout.NORTH);
        container.add(radioButton3,BorderLayout.SOUTH);
    
        //add
        this.setVisible(true);
        this.setSize(500, 300);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }
    
    public static void main(String[] args) {
        new JButtonDemo01();
    }
}
```

## 多选框

```java
public class JButtonDemo01 extends JFrame {
    public JButtonDemo01() {
        Container container = this.getContentPane();
        //将一个图片变成图标
        UPL resource = JButtonDemo01.class.getResource("tx.jpg");
        Icon icon = new ImageIcon(resource);
        //多选框
        JCheckBox checkBox01=new JCheckBox("checkBox01");
        JCheckBox checkBox02=new JCheckBox("checkBox02");
        
        container.add(checkBox01,BorderLayout.NORTH);
        container.add(checkBox02,BorderLayout.SOUTH);
    
        //add
        this.setVisible(true);
        this.setSize(500, 300);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }
    
    public static void main(String[] args) {
        new JButtonDemo01();
    }
}
```

## 下拉框

```java
public class TestComboboxDemo01 extends JFrame {
    public TestComboboxDemo01() {
        Container container = this.getContentPane();
        JComboBox status = new JComboBox();
        status.addItem(null); //默认选择项
        status.addItem("正在热映");
        status.addItem("已下架");
        status.addItem("即将上映");

        container.add(status);
    
        this.setVisible(true);
        this.setSize(500, 350);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }
    
    public static void main(String[] args) {
        new TestComboboxDemo01();
    }

}
```

## 列表框

```java
public class TestComboboxDemo01 extends JFrame {
    public TestComboboxDemo01() {
        Container container = this.getContentPane();
        //生成列表内容
        Vector contents=new Vector();
        //列表中需要放入内容
        JList jList=new JList(contents);

        contents.add("zhangsan");
        contents.add("lisi");
        contents.add("wangwu");
    
        container.add(jList);
    
        this.setVisible(true);
        this.setSize(500, 350);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }
    
    public static void main(String[] args) {
        new TestComboboxDemo01();
    }
}
```

应用场景：和下拉框联动

​	1）选择地区，或者单个选项

​	2）列表、展示信息，一般是 “动态扩容”。

## 文本框
```java
public class TestTextDemo01 extends JFrame {
    public TestTextDemo01() {
        Container container = this.getContentPane();

        JTextField textField = new JTextField("hello");
        JTextField textField2 = new JTextField("world", 20);
    
        container.add(textField, BorderLayout.NORTH);
        container.add(textField2, BorderLayout.SOUTH);
    
        this.setVisible(true);
        this.setSize(500, 350);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }
    
    public static void main(String[] args) {
        new TestTextDemo01();
    }
}
```

## 密码框

```java
public class TestTextDemo02 extends JFrame {
    public TestTextDemo02() {
        Container container = this.getContentPane();

        JPasswordField passwordField = new JPasswordField();
        passwordField.setEchoChar('*');
    
        container.add(passwordField);
    
        this.setVisible(true);
        this.setSize(500, 350);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }
    
    public static void main(String[] args) {
        new TestTextDemo01();
    }

}
```

## 文本域

一般和面板一起使用。

```java
public class JPanelDemo extends JFrame {
    public JPanelDemo() {
        Container container = this.getContentPane();
        container.setLayout(new GridLayout(2, 1, 10, 10));//后面的参数的意思，间距
		JTextArea textArea = new JTextArea(20, 50);
        textArea.setText("一起来学GUI");
        container.add(textArea);
        this.setVisible(true);
        this.setSize(500, 500);
        this.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {
        new JPanelDemo();
    }
}
```





















