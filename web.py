from flask import Flask, render_template, request, redirect
from flask import make_response, Response
import xlrd
import json
import re

classbook = xlrd.open_workbook('class.xls')
eng = classbook.sheet_by_name('English').col_values(0)
jap = classbook.sheet_by_name('Japanese').col_values(0)
name = classbook.sheet_by_name('name')
namelis = {name.col_values(0)[i]: name.col_values(1)[i] for i in range(200)}
findLine = re.compile(r"](.*)")
# print(namelis)

app = Flask(__name__)
app.secret_key = 'TSOPsalm46'
app.debug = True


@app.route('/')
def index():
	return render_template('index.html', eng=eng, jap=jap, namelis=namelis)


@app.route('/music/<name>')
def music(name):
	if name not in namelis.keys():
		return redirect('/')
	else:
		catagory = 'English' if name in eng else 'Japanese'
		file = open('static/'+catagory+'/'+name+'.txt', 'r')
		lines = file.read()
		lines = json.loads(lines)
		pre_ = '%03d' %(int(name)-1)
		next_ = '%03d' %(int(name)+1)
		title = namelis[name]
		return render_template('music.html', catagory=catagory, name=name, pre_=pre_, next_=next_, lines=lines, name_=title)


def main():
	# 请求一旦到来，执行第三个参数
	app.run(host='0.0.0.0', port=81)  # run_simple(host,port,app)


if __name__ == '__main__':
	main()
